import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACTIVE_AGENCY_COOKIE } from "@/lib/auth/active-agency-cookie";
import { ACTIVE_ORGANIZATION_COOKIE } from "@/lib/auth/active-org-cookie";
import {
  loginErrorParamFromGetAppAuthFailure,
  messageFromUnknownError,
} from "@/lib/auth/get-app-auth-failure";
import {
  DEV_BYPASS_ALLOWED_EMAIL,
  isAllowedDevBypassEmail,
  isDevLoginBypassEnabled,
} from "@/lib/auth/dev-login-bypass";
import { prisma } from "@/lib/prisma";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/admin";
import {
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/supabase/env";
import { getSupabaseAuthCookieOptions } from "@/lib/supabase/session-cookie-options";

export const dynamic = "force-dynamic";

type CookieWrite = { value: string; options?: Parameters<NextResponse["cookies"]["set"]>[2] };

type DevLoginOk = {
  redirectPath: string;
  cookieWrites: Map<string, CookieWrite>;
  rawEmail: string;
};

/** Query param keys for /login — surfaced in OAUTH_ERROR_MESSAGES (no secrets). */
type DevLoginErrorCode =
  | "dev_login"
  | "dev_login_disabled"
  | "dev_login_supabase"
  | "dev_login_service_role"
  | "dev_login_email"
  | "dev_login_prisma_user"
  | "dev_login_link"
  | "dev_login_verify";

type DevLoginFail = {
  ok: false;
  code: DevLoginErrorCode;
  httpStatus: number;
  message: string;
};

type DevLoginRunResult = { ok: true; data: DevLoginOk } | DevLoginFail;

/**
 * Core: Admin generateLink + anon verifyOtp → Supabase session cookies (same as email OTP).
 */
async function runDevLoginIssueSession(input: {
  rawEmail: string;
  nextPath: string;
}): Promise<DevLoginRunResult> {
  if (!isDevLoginBypassEnabled()) {
    return {
      ok: false,
      code: "dev_login_disabled",
      httpStatus: 404,
      message: "Not found",
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      code: "dev_login_supabase",
      httpStatus: 503,
      message: "Supabase is not configured",
    };
  }

  const serviceKey = getSupabaseServiceRoleKey();
  if (!serviceKey) {
    return {
      ok: false,
      code: "dev_login_service_role",
      httpStatus: 503,
      message: "SUPABASE_SERVICE_ROLE_KEY is required for dev login (local .env only)",
    };
  }

  if (!isAllowedDevBypassEmail(input.rawEmail)) {
    return {
      ok: false,
      code: "dev_login_email",
      httpStatus: 403,
      message: "Dev login supports only ashley@ymbs.pro",
    };
  }

  const supabaseUrl = getSupabaseUrl()!;
  const anonKey = getSupabaseAnonKey()!;

  let dbUser = await prisma.user.findUnique({
    where: { email: input.rawEmail },
    select: { id: true, isPlatformAdmin: true },
  });
  if (!dbUser) {
    return {
      ok: false,
      code: "dev_login_prisma_user",
      httpStatus: 404,
      message: "No app user for this email — seed or create the Prisma user first",
    };
  }

  /** Dev bypass is the platform operator — ensure DB flag matches hub + /platform-admin layout (avoids overview + forbidden). */
  if (input.rawEmail === DEV_BYPASS_ALLOWED_EMAIL && !dbUser.isPlatformAdmin) {
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { isPlatformAdmin: true },
    });
    dbUser = { id: dbUser.id, isPlatformAdmin: true };
  }

  const admin = createServiceRoleSupabaseClient("api/auth/dev-login");

  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: input.rawEmail,
  });

  if (linkErr || !linkData?.properties?.email_otp) {
    console.error("[dev-login-bypass] generateLink failed:", linkErr?.message ?? "no otp");
    return {
      ok: false,
      code: "dev_login_link",
      httpStatus: 500,
      message: "Could not issue dev credentials",
    };
  }

  const otp = linkData.properties.email_otp;

  /**
   * Always land via `/auth/post-signin` (same as email OTP). Jumping straight to `/platform-admin` skipped that
   * hop; some clients and the dashboard shell then hit harder failures (500 / “page isn’t working”) when
   * cookies or Prisma state were not ready the same way as the normal sign-in path.
   */
  const redirectPath = `/auth/post-signin?next=${encodeURIComponent(input.nextPath)}`;

  const cookieStore = await cookies();
  const cookieWrites = new Map<string, CookieWrite>();

  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookieOptions: getSupabaseAuthCookieOptions(),
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          cookieWrites.set(name, { value, options });
        }
      },
    },
  });

  const { error: verifyErr } = await supabase.auth.verifyOtp({
    email: input.rawEmail,
    token: otp,
    type: "email",
  });

  if (verifyErr) {
    console.error("[dev-login-bypass] verifyOtp failed:", verifyErr.message);
    return {
      ok: false,
      code: "dev_login_verify",
      httpStatus: 500,
      message: "Could not establish session",
    };
  }

  return {
    ok: true,
    data: { redirectPath, cookieWrites, rawEmail: input.rawEmail },
  };
}

function applyAuthCookiesToResponse(res: NextResponse, cookieWrites: Map<string, CookieWrite>): NextResponse {
  for (const [name, { value, options }] of cookieWrites) {
    res.cookies.set(name, value, options);
  }
  res.cookies.delete(ACTIVE_ORGANIZATION_COOKIE);
  res.cookies.delete(ACTIVE_AGENCY_COOKIE);
  return res;
}

/**
 * Browser navigation dev login — no React onClick/fetch required.
 * Use a plain <a href> (not next/link) so the request is not prefetched.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const nextParam = url.searchParams.get("next");
  const nextPath =
    nextParam?.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/overview";

  console.log("[dev-login-bypass] GET", { nextPath, origin: url.origin });

  try {
    const result = await runDevLoginIssueSession({
      rawEmail: DEV_BYPASS_ALLOWED_EMAIL,
      nextPath,
    });

    if (!result.ok) {
      /** Browser navigation: JSON 4xx/5xx often shows as a broken page in embedded previews. */
      const login = new URL("/login", url.origin);
      login.searchParams.set("error", result.code);
      return NextResponse.redirect(login);
    }

    const { redirectPath, cookieWrites, rawEmail } = result.data;
    const dest = new URL(redirectPath, url.origin);
    let res = NextResponse.redirect(dest);
    res = applyAuthCookiesToResponse(res, cookieWrites);

    if (process.env.NODE_ENV === "development") {
      console.info("[dev-login-bypass] GET redirect", { nextPath, redirectPath, email: rawEmail });
    }
    console.warn(
      `[dev-login-bypass] GET issued Supabase session for ${rawEmail} — dev-only; do not enable in production`,
    );

    return res;
  } catch (err) {
    const summary = messageFromUnknownError(err);
    console.error("[dev-login-bypass] GET failed", summary, err);
    const login = new URL("/login", url.origin);
    // Prisma (e.g. unreachable Supabase Postgres) throws here during findUnique — surface db_* not generic dev_login.
    const mapped = loginErrorParamFromGetAppAuthFailure(err);
    login.searchParams.set("error", mapped === "auth_backend" ? "dev_login" : mapped);
    return NextResponse.redirect(login);
  }
}

/**
 * JSON + Set-Cookie (SPA / fetch). Prefer GET + <a href> if clicks are swallowed in your environment.
 */
export async function POST(request: Request) {
  let body: { email?: string; next?: string };
  try {
    body = (await request.json()) as { email?: string; next?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const emailForLogin =
    typeof body.email === "string" && body.email.trim()
      ? body.email.trim().toLowerCase()
      : DEV_BYPASS_ALLOWED_EMAIL;

  const nextPath =
    typeof body.next === "string" && body.next.startsWith("/") && !body.next.startsWith("//")
      ? body.next
      : "/overview";

  console.log("[dev-login-bypass] POST", { rawEmail: emailForLogin, nextPath });

  const result = await runDevLoginIssueSession({ rawEmail: emailForLogin, nextPath });

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.httpStatus });
  }

  const { redirectPath, cookieWrites, rawEmail: issuedFor } = result.data;
  let res: NextResponse = NextResponse.json({ ok: true as const, redirect: redirectPath });
  res = applyAuthCookiesToResponse(res, cookieWrites);

  console.warn(
    `[dev-login-bypass] POST issued Supabase session for ${issuedFor} — dev-only; do not enable in production`,
  );

  return res;
}
