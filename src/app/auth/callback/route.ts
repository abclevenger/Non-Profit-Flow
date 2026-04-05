import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * OAuth/OIDC return (e.g. LinkedIn). Supabase redirects here with ?code=;
 * we exchange for a session and set auth cookies, then redirect to `next`.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next");
  const next =
    nextParam?.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/overview";

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${url.origin}/login?error=config`);
  }

  if (!code) {
    return NextResponse.redirect(`${url.origin}/login?error=missing_code`);
  }

  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${url.origin}/login?error=oauth`);
  }

  const dest = `/auth/post-signin?next=${encodeURIComponent(next)}`;
  return NextResponse.redirect(`${url.origin}${dest}`);
}
