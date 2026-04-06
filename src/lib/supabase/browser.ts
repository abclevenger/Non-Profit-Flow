"use client";

import { PENDING_AUTH_PERSIST_KEY } from "@/lib/auth/auth-persist-tier";
import { createBrowserClient } from "@supabase/ssr";
import { AUTH_PERSIST_TIER_COOKIE, getSupabaseAuthCookieOptions, isLongLivedPersistFromTierCookie } from "./session-cookie-options";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

function readBrowserAuthLongLived(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const p = sessionStorage.getItem(PENDING_AUTH_PERSIST_KEY);
    if (p === "0") return false;
    if (p === "1") return true;
  } catch {
    /* ignore */
  }
  try {
    const match = document.cookie.match(
      new RegExp(`(?:^|; )${AUTH_PERSIST_TIER_COOKIE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`),
    );
    const v = match?.[1];
    return isLongLivedPersistFromTierCookie(v);
  } catch {
    return true;
  }
}

/** Browser / Client Components — anon key only; cookie max-age follows trust tier + pending sign-in. */
export function createBrowserSupabaseClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY).",
    );
  }
  const longLived = readBrowserAuthLongLived();
  return createBrowserClient(url, key, {
    cookieOptions: getSupabaseAuthCookieOptions(longLived),
  });
}
