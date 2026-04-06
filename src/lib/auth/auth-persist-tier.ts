import {
  AUTH_PERSIST_TIER_COOKIE,
  AUTH_PERSIST_TIER_FLAG_MAX_AGE_SEC,
} from "@/lib/supabase/session-cookie-options";

/** SessionStorage: next `createBrowserSupabaseClient()` uses this before tier cookie exists. */
export const PENDING_AUTH_PERSIST_KEY = "npf_pending_auth_persist";

export function setPendingAuthPersist(longLived: boolean): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PENDING_AUTH_PERSIST_KEY, longLived ? "1" : "0");
  } catch {
    /* private mode */
  }
}

export function clearPendingAuthPersist(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(PENDING_AUTH_PERSIST_KEY);
  } catch {
    /* ignore */
  }
}

/** Sets readable tier cookie before `/api/auth/me` so the server matches browser cookie max-age. */
export function setAuthPersistTierCookie(longLived: boolean): void {
  if (typeof window === "undefined") return;
  const val = longLived ? "1" : "0";
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${AUTH_PERSIST_TIER_COOKIE}=${val}; Path=/; Max-Age=${AUTH_PERSIST_TIER_FLAG_MAX_AGE_SEC}; SameSite=Lax${secure}`;
}

export function clearAuthPersistTierCookie(): void {
  if (typeof window === "undefined") return;
  document.cookie = `${AUTH_PERSIST_TIER_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
