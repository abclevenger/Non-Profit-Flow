import { createServerClient } from "@supabase/ssr";
import type { cookies } from "next/headers";
import { AUTH_PERSIST_TIER_COOKIE, getSupabaseAuthCookieOptions, isLongLivedPersistFromTierCookie } from "./session-cookie-options";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "./env";

type CookieStore = Awaited<ReturnType<typeof cookies>>;

/**
 * Server Components, Server Actions, Route Handlers — anon key + cookie session.
 * `longLived` when set overrides the `npf_auth_persist` tier cookie (e.g. OAuth callback before tier is written).
 */
export function createServerSupabaseClient(
  cookieStore: CookieStore,
  opts?: { longLived?: boolean },
) {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  let longLived = true;
  if (opts && typeof opts.longLived === "boolean") {
    longLived = opts.longLived;
  } else {
    const tier = cookieStore.get(AUTH_PERSIST_TIER_COOKIE)?.value;
    longLived = isLongLivedPersistFromTierCookie(tier);
  }

  return createServerClient(url, key, {
    cookieOptions: getSupabaseAuthCookieOptions(longLived),
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
