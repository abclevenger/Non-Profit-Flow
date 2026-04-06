import "server-only";

import { getPublicAppUrl } from "@/lib/env/public-app-url";

/**
 * Exact `redirectTo` passed to Supabase `resetPasswordForEmail`.
 * Must match an entry under Supabase → Authentication → URL configuration → Redirect URLs
 * (e.g. `https://your-domain.com/auth/callback` or `https://your-domain.com/**`).
 */
export function getPasswordRecoveryRedirectTo(): string {
  const base = getPublicAppUrl().replace(/\/$/, "");
  const u = new URL("/auth/callback", `${base}/`);
  u.searchParams.set("next", "/reset-password");
  u.searchParams.set("td", "1");
  return u.toString();
}
