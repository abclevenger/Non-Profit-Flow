import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value }) => {
    to.cookies.set(name, value);
  });
}

export async function proxy(req: NextRequest) {
  const { response: supabaseResponse, supabaseUser } = await updateSupabaseSession(req);
  const { pathname } = req.nextUrl;

  const publicPaths = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/auth/callback",
  ];
  const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (pathname.startsWith("/api/auth")) {
    return supabaseResponse;
  }
  if (pathname.startsWith("/api/supabase/")) {
    return supabaseResponse;
  }
  // Stripe sends signed webhooks without browser cookies; must not redirect to login.
  if (pathname === "/api/stripe/webhook" || pathname.startsWith("/api/stripe/webhook/")) {
    return supabaseResponse;
  }

  if (isPublic) {
    return supabaseResponse;
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase auth is not configured (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY)." },
      { status: 503 },
    );
  }

  if (!supabaseUser) {
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname + req.nextUrl.search);
    const redirect = NextResponse.redirect(login);
    copyCookies(supabaseResponse, redirect);
    return redirect;
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
