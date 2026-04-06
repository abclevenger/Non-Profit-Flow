/**
 * Prisma `User.passwordHash` (bcrypt) sign-in, then Supabase session via admin magic-link OTP.
 * Enabled in development by default; on production only when ALLOW_SEEDED_PASSWORD_LOGIN is set.
 */
export function isSeededPasswordLoginEnabled(): boolean {
  if (process.env.NODE_ENV === "production") {
    const v = process.env.ALLOW_SEEDED_PASSWORD_LOGIN?.trim().toLowerCase();
    return v === "1" || v === "true" || v === "yes";
  }
  return true;
}
