/**
 * Supabase SSR auth cookie lifetimes — aligned with “Trust this device for 30 days”.
 * Short mode (unchecked) uses a browser-session-friendly window so users re-verify sooner on shared PCs.
 * Refresh-token rotation still follows Supabase project settings.
 */

export const SUPABASE_AUTH_COOKIE_MAX_AGE_SEC = 30 * 24 * 60 * 60;

const DEFAULT_SHORT_MAX_AGE_SEC = 12 * 60 * 60;

function parsedShortMaxAgeSec(): number {
  const raw = process.env.SUPABASE_AUTH_COOKIE_SHORT_MAX_AGE_SEC;
  if (!raw) return DEFAULT_SHORT_MAX_AGE_SEC;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 60) return DEFAULT_SHORT_MAX_AGE_SEC;
  return n;
}

/** When the user does not trust the device — shorter cookie max-age (not “30-day stay signed in”). */
export const SUPABASE_AUTH_COOKIE_SHORT_MAX_AGE_SEC = parsedShortMaxAgeSec();

/**
 * First-party flag so the proxy/server can apply matching max-age on refresh.
 * Not a secret; cleared on sign-out.
 */
export const AUTH_PERSIST_TIER_COOKIE = "npf_auth_persist";

/** Keep the tier flag longer than any auth cookie so refresh picks the right max-age. */
export const AUTH_PERSIST_TIER_FLAG_MAX_AGE_SEC = 400 * 24 * 60 * 60;

export function getSupabaseAuthCookieOptions(longLived = true): {
  path: string;
  sameSite: "lax";
  maxAge: number;
  secure: boolean;
} {
  return {
    path: "/",
    sameSite: "lax",
    maxAge: longLived ? SUPABASE_AUTH_COOKIE_MAX_AGE_SEC : SUPABASE_AUTH_COOKIE_SHORT_MAX_AGE_SEC,
    secure: process.env.NODE_ENV === "production",
  };
}

export function getAuthPersistTierCookieOptions(value: "0" | "1"): {
  name: string;
  value: string;
  path: string;
  sameSite: "lax";
  maxAge: number;
  secure: boolean;
  httpOnly: false;
} {
  return {
    name: AUTH_PERSIST_TIER_COOKIE,
    value,
    path: "/",
    sameSite: "lax",
    maxAge: AUTH_PERSIST_TIER_FLAG_MAX_AGE_SEC,
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
  };
}

/** Prefer explicit tier cookie; default long-lived when unset (back-compat). */
export function isLongLivedPersistFromTierCookie(tierValue: string | undefined): boolean {
  return tierValue !== "0";
}
