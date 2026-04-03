import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

export type SupabaseMiddlewareResult = {
  response: NextResponse;
  /** Supabase Auth user if session is valid after refresh. */
  supabaseUser: User | null;
};

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

  const supabase = createServerClient(url, key, {
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

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error && process.env.NODE_ENV === "development") {
    console.warn("[supabase] middleware getUser:", error.message);
  }

  return { response: supabaseResponse, supabaseUser: user ?? null };
}
