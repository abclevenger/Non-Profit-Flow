import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";
import {
  AUTH_PERSIST_TIER_COOKIE,
  getSupabaseAuthCookieOptions,
  isLongLivedPersistFromTierCookie,
} from "./session-cookie-options";

export type SupabaseMiddlewareResult = {
  response: NextResponse;
  /** Supabase Auth user if session is valid after refresh. */
  supabaseUser: User | null;
};

/**
 * True when the request carries Supabase SSR auth cookies (incl. chunked `*.0`, `*.1`, …).
 * Used to avoid an immediate /login redirect while tokens are still settling.
 */
export function hasLikelySupabaseAuthCookies(request: NextRequest): boolean {
  return request.cookies.getAll().some((c) => {
    if (!c.name.startsWith("sb-")) return false;
    return c.name.includes("auth-token") || c.name.includes("access-token");
  });
}

/**
 * Refresh Supabase Auth cookies and return the current user (Edge-safe).
 */
export async function updateSupabaseSession(request: NextRequest): Promise<SupabaseMiddlewareResult> {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) {
    return { response: NextResponse.next({ request }), supabaseUser: null };
  }

  let supabaseResponse = NextResponse.next({ request });

  const tier = request.cookies.get(AUTH_PERSIST_TIER_COOKIE)?.value;
  const longLived = isLongLivedPersistFromTierCookie(tier);

  const supabase = createServerClient(url, key, {
    cookieOptions: getSupabaseAuthCookieOptions(longLived),
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  /**
   * Refresh session from cookies first so rotated tokens are written via setAll.
   * Without this, getUser() can see "Auth session missing" right after sign-in while cookies exist.
   */
  const { error: sessionError } = await supabase.auth.getSession();
  if (sessionError && process.env.NODE_ENV === "development") {
    console.warn("[supabase] proxy getSession:", sessionError.message);
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error && process.env.NODE_ENV === "development") {
    console.warn("[supabase] proxy getUser:", error.message);
  }

  return { response: supabaseResponse, supabaseUser: user ?? null };
}
