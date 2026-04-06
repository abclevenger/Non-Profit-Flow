import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACTIVE_AGENCY_COOKIE } from "@/lib/auth/active-agency-cookie";
import { ACTIVE_ORGANIZATION_COOKIE } from "@/lib/auth/active-org-cookie";
import {
  loginErrorParamFromGetAppAuthFailure,
  messageFromUnknownError,
} from "@/lib/auth/get-app-auth-failure";
import { issueSupabaseEmailOtpSession, type CookieWrite } from "@/lib/auth/issue-supabase-email-otp-session";
import { isSeededPasswordLoginEnabled } from "@/lib/auth/seeded-password-login";
import { prisma } from "@/lib/prisma";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

function applyAuthCookiesToResponse(res: NextResponse, cookieWrites: Map<string, CookieWrite>): NextResponse {
  for (const [name, { value, options }] of cookieWrites) {
    res.cookies.set(name, value, options);
  }
  res.cookies.delete(ACTIVE_ORGANIZATION_COOKIE);
  res.cookies.delete(ACTIVE_AGENCY_COOKIE);
  return res;
}

/**
 * Verifies Prisma `passwordHash` and issues the same Supabase cookie session as email OTP / dev-login.
 */
export async function POST(request: Request) {
  if (!isSeededPasswordLoginEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: { email?: string; password?: string; next?: string };
  try {
    body = (await request.json()) as { email?: string; password?: string; next?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email =
    typeof body.email === "string" && body.email.trim() ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const nextPath =
    typeof body.next === "string" && body.next.startsWith("/") && !body.next.startsWith("//")
      ? body.next
      : "/overview";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    const ok = await compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const cookieStore = await cookies();
    const issued = await issueSupabaseEmailOtpSession({
      email,
      nextPath,
      cookieStore,
    });

    if (!issued.ok) {
      return NextResponse.json({ error: issued.message }, { status: issued.httpStatus });
    }

    let res: NextResponse = NextResponse.json({
      ok: true as const,
      redirect: issued.data.redirectPath,
    });
    res = applyAuthCookiesToResponse(res, issued.data.cookieWrites);
    return res;
  } catch (err) {
    console.error("[seeded-password-login]", messageFromUnknownError(err), err);
    const code = loginErrorParamFromGetAppAuthFailure(err);
    return NextResponse.json(
      {
        error: "Sign-in failed",
        code,
      },
      { status: code === "db_connect" || code === "db_env" ? 503 : 500 },
    );
  }
}
