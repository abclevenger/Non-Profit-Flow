/**
 * Public origin for absolute links (e.g. password reset). Prefer explicit AUTH_URL on Vercel
 * so preview vs production and custom domains are correct.
 */
export function getPublicAppUrl(): string {
  const explicit = process.env.AUTH_URL?.trim() || process.env.NEXTAUTH_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}
