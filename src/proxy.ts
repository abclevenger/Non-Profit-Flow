import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  hasLikelySupabaseAuthCookies,
  updateSupabaseSession,
} from "@/lib/supabase/update-supabase-session";

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value }) => {
    to.cookies.set(name, value);
  });
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  /** Without `export const config` (Turbopack 16.2 can error on matcher parsing), skip static assets here. */
  if (
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/_next/image") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }
  const lastSegment = pathname.split("/").pop() ?? "";
  if (lastSegment.includes(".") && !pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const { response: supabaseResponse, supabaseUser } = await updateSupabaseSession(req);

  const publicPaths = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/auth/callback",
    "/auth/post-signin",
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
    /**
     * Earliest /login redirect in the stack: do not send users away if Supabase cookies are present.
     * getUser() can lag getSession/refresh for one navigation; RSC + /api/auth/me then recover.
     */
    if (hasLikelySupabaseAuthCookies(req)) {
      if (process.env.NODE_ENV === "development") {
        console.info("[auth:debug] proxy skip /login — sb auth cookies present, user null after refresh");
      }
      return supabaseResponse;
    }
    if (process.env.NODE_ENV === "development") {
      console.info("[auth:debug] proxy → /login (no Supabase user, no sb auth cookies)", { pathname });
    }
    const login = new URL("/login", req.nextUrl.origin);
    login.searchParams.set("callbackUrl", pathname + req.nextUrl.search);
    const redirect = NextResponse.redirect(login);
    copyCookies(supabaseResponse, redirect);
    return redirect;
  }

  return supabaseResponse;
}
