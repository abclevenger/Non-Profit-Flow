import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAuthPersistTierCookieOptions } from "@/lib/supabase/session-cookie-options";

export const dynamic = "force-dynamic";

/**
 * OAuth/OIDC return (e.g. LinkedIn) and email magic links. Supabase redirects with ?code=;
 * we exchange for a session and set auth cookies, then redirect to `next`.
 * `td=0` = do not trust device (shorter cookie max-age); omit or `td=1` = 30-day persistence.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next");
  const next =
    nextParam?.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/overview";
  const td = url.searchParams.get("td");
  const longLived = td !== "0" && td !== "false";

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${url.origin}/login?error=config`);
  }

  if (!code) {
    return NextResponse.redirect(`${url.origin}/login?error=missing_code`);
  }

  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore, { longLived });
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${url.origin}/login?error=oauth`);
  }

  const tier = getAuthPersistTierCookieOptions(longLived ? "1" : "0");
  cookieStore.set(tier.name, tier.value, {
    path: tier.path,
    sameSite: tier.sameSite,
    maxAge: tier.maxAge,
    secure: tier.secure,
    httpOnly: tier.httpOnly,
  });

  const dest = `/auth/post-signin?next=${encodeURIComponent(next)}`;
  return NextResponse.redirect(`${url.origin}${dest}`);
}
