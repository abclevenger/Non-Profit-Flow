import { createServerClient } from "@supabase/ssr";
import type { cookies } from "next/headers";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "./env";

type CookieStore = Awaited<ReturnType<typeof cookies>>;

/**
 * Server Components, Server Actions, Route Handlers — anon key + cookie session.
 * Throws if public env is missing (call isSupabaseConfigured() first to avoid).
 */
export function createServerSupabaseClient(cookieStore: CookieStore) {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Component — middleware refreshes the session.
        }
      },
    },
  });
}

/** Safe for pages that should render without Supabase (e.g. setup messaging). */
export function tryCreateServerSupabaseClient(cookieStore: CookieStore) {
  if (!isSupabaseConfigured()) return null;
  return createServerSupabaseClient(cookieStore);
}
