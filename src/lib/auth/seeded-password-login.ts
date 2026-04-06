/**
 * Prisma `User.passwordHash` (bcrypt) sign-in, then Supabase session via server-side OTP verify
 * (no email to the user). Disabled in production only when DISABLE_PRISMA_PASSWORD_LOGIN is set.
 */
export function isSeededPasswordLoginEnabled(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  const d = process.env.DISABLE_PRISMA_PASSWORD_LOGIN?.trim().toLowerCase();
  return !(d === "1" || d === "true" || d === "yes");
}
