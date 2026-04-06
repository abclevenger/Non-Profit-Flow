/**
 * Service-role “instant session” dev login (`/api/auth/dev-login`). Off unless explicitly enabled.
 * Never enable in production.
 */

import "server-only";

/** Single supported identity for dev bypass (expand later if needed). */
export const DEV_BYPASS_ALLOWED_EMAIL = "ashley@ymbs.pro" as const;

/** True only when ENABLE_DEV_LOGIN_BYPASS is set (including local dev). */
export function isDevLoginBypassEnabled(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  const v = process.env.ENABLE_DEV_LOGIN_BYPASS?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export function isAllowedDevBypassEmail(normalizedEmail: string): boolean {
  return normalizedEmail === DEV_BYPASS_ALLOWED_EMAIL;
}
