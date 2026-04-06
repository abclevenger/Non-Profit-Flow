/**
 * Canonical public origin (no trailing slash) for server-generated absolute links:
 * password reset, emails, etc.
 *
 * Priority:
 * 1. AUTH_URL — set on Vercel Production/Preview to the deployment URL or custom domain
 * 2. NEXT_PUBLIC_APP_URL — same origin as the browser; use when AUTH_URL is unset
 * 3. NEXTAUTH_URL — legacy
 * 4. VERCEL_URL — `*.vercel.app` host only (no protocol in Vercel env)
 *
 * If none match, Supabase may fall back to its Dashboard “Site URL” (often `/` only) for
 * recovery redirects — set AUTH_URL explicitly.
 */
export function getPublicAppUrl(): string {
  const explicit =
    process.env.AUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `https://${host}`;
  }
  return "http://localhost:3000";
}
