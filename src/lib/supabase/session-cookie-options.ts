/**
 * Supabase SSR auth cookie lifetime — aligned with “trust this device” (30 days).
 * Caps persistence so sessions are not effectively unlimited; refresh tokens still rotate per project settings.
 * Safe on Edge and in the browser bundle (no secrets).
 */
export const SUPABASE_AUTH_COOKIE_MAX_AGE_SEC = 30 * 24 * 60 * 60;

export function getSupabaseAuthCookieOptions(): {
  path: string;
  sameSite: "lax";
  maxAge: number;
  secure: boolean;
} {
  return {
    path: "/",
    sameSite: "lax",
    maxAge: SUPABASE_AUTH_COOKIE_MAX_AGE_SEC,
    secure: process.env.NODE_ENV === "production",
  };
}
