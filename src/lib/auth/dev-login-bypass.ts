/**
 * TEMPORARY / LOCAL ONLY — remove when you no longer need passwordless dev sign-in.
 *
 * Gates server routes and (via prop from the login page) the dev login UI.
 * Production stays safe as long as you never set ENABLE_DEV_LOGIN_BYPASS in prod
 * and ship production builds (NODE_ENV=production).
 */

import "server-only";

/** Single supported identity for dev bypass (expand later if needed). */
export const DEV_BYPASS_ALLOWED_EMAIL = "ashley@ymbs.pro" as const;

/** True when dev bypass is allowed to run (server-side). */
export function isDevLoginBypassEnabled(): boolean {
  if (process.env.NODE_ENV === "development") return true;
  return process.env.ENABLE_DEV_LOGIN_BYPASS === "true";
}

export function isAllowedDevBypassEmail(normalizedEmail: string): boolean {
  return normalizedEmail === DEV_BYPASS_ALLOWED_EMAIL;
}
