import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAuthPersistTierCookieOptions } from "@/lib/supabase/session-cookie-options";

export const dynamic = "force-dynamic";

/**
 * OAuth/OIDC return (e.g. LinkedIn), Supabase email confirmations, and password-recovery links.
 * Supabase redirects with `?code=`; we exchange for a session, set cookies, then redirect to `next`.
 * Password recovery uses `next=/reset-password` and skips `/auth/post-signin` so the user can set a new password.
 * `td=0` = shorter cookie max-age; omit or `td=1` = long-lived (see session-cookie-options).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next");
  const next =
    nextParam?.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/overview";
  const nextPathOnly = (nextParam?.split("?")[0] ?? "").trim();
  const isPasswordRecoveryFlow =
    nextPathOnly === "/reset-password" || nextPathOnly.startsWith("/reset-password/");
  const td = url.searchParams.get("td");
  const longLived = td !== "0" && td !== "false";

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${url.origin}/login?error=config`);
  }

  if (!code) {
    const err = isPasswordRecoveryFlow ? "reset_session" : "missing_code";
    return NextResponse.redirect(`${url.origin}/login?error=${err}`);
  }

  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore, { longLived });
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const err = isPasswordRecoveryFlow ? "reset_session" : "oauth";
    return NextResponse.redirect(`${url.origin}/login?error=${err}`);
  }

  const tier = getAuthPersistTierCookieOptions(longLived ? "1" : "0");
  cookieStore.set(tier.name, tier.value, {
    path: tier.path,
    sameSite: tier.sameSite,
    maxAge: tier.maxAge,
    secure: tier.secure,
    httpOnly: tier.httpOnly,
  });

  const nextPathForRedirect = (next.split("?")[0] ?? next).trim() || "/overview";
  const isPasswordRecovery =
    nextPathForRedirect === "/reset-password" || nextPathForRedirect.startsWith("/reset-password/");
  if (isPasswordRecovery) {
    return NextResponse.redirect(new URL(next, url.origin));
  }

  const dest = `/auth/post-signin?next=${encodeURIComponent(next)}`;
  return NextResponse.redirect(`${url.origin}${dest}`);
}
