/**
 * Client-only: 30-day “trust this device” marker (localStorage + first-party cookie flag).
 * Does not store secrets — records opt-in for long idle timeout + calendar re-auth at expiry.
 * Supabase auth cookies use the same 30-day maxAge via `getSupabaseAuthCookieOptions()` (see lib/supabase).
 */

export const TRUSTED_DEVICE_STORAGE_KEY = "npf_trusted_device_v1";
/** Set before OAuth redirect; consumed after successful return (see AppAuthProvider). */
export const OAUTH_TRUST_INTENT_KEY = "npf_oauth_trust_intent_v1";

export const TRUSTED_DEVICE_DAYS = 30;

const COOKIE_NAME = "npf_trusted";

function maxAgeSeconds(): number {
  return TRUSTED_DEVICE_DAYS * 24 * 60 * 60;
}

export type TrustedDevicePayload = { v: 1; until: number };

export function writeTrustedDeviceMarker(): void {
  if (typeof window === "undefined") return;
  const until = Date.now() + maxAgeSeconds() * 1000;
  const payload: TrustedDevicePayload = { v: 1, until };
  try {
    localStorage.setItem(TRUSTED_DEVICE_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_NAME}=1; Path=/; Max-Age=${maxAgeSeconds()}; SameSite=Lax${secure}`;
}

export function clearTrustedDeviceMarker(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(TRUSTED_DEVICE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

/** True when the user opted in and the 30-day window has not passed. */
export function isTrustedDeviceActive(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(TRUSTED_DEVICE_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as Partial<TrustedDevicePayload>;
    if (parsed.v !== 1 || typeof parsed.until !== "number") return false;
    return Date.now() < parsed.until;
  } catch {
    return false;
  }
}

/**
 * True when a stored trust marker exists but is past `until`.
 * Callers typically clear the marker and treat the device as non-trusted (stricter idle);
 * avoid signing out a valid Supabase session here — it races with fresh sign-in (email OTP).
 */
export function trustedDeviceExpiryRequiresReauth(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(TRUSTED_DEVICE_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as Partial<TrustedDevicePayload>;
    if (parsed.v !== 1 || typeof parsed.until !== "number") return false;
    return Date.now() >= parsed.until;
  } catch {
    return false;
  }
}

/** Call before LinkedIn (or other) OAuth redirect to remember checkbox state for the return trip. */
export function setOauthTrustIntent(trust: boolean): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(OAUTH_TRUST_INTENT_KEY, trust ? "1" : "0");
  } catch {
    /* ignore */
  }
}

/** Read and remove OAuth trust intent; returns null if none. */
export function consumeOauthTrustIntent(): boolean | null {
  if (typeof window === "undefined") return null;
  try {
    const v = sessionStorage.getItem(OAUTH_TRUST_INTENT_KEY);
    if (v === null) return null;
    sessionStorage.removeItem(OAUTH_TRUST_INTENT_KEY);
    return v === "1";
  } catch {
    return null;
  }
}

/** Drop pending OAuth intent (e.g. user chose email OTP instead or OAuth failed). */
export function clearOauthTrustIntent(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(OAUTH_TRUST_INTENT_KEY);
  } catch {
    /* ignore */
  }
}
