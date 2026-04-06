/**
 * Legacy: Prisma `passwordHash` + server-issued Supabase session (pre–password-first migration).
 * Enable only for transitional accounts with no Supabase password yet.
 */
export function isLegacyPrismaPasswordLoginEnabled(): boolean {
  const v = process.env.ENABLE_LEGACY_PRISMA_PASSWORD_LOGIN?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

/** @deprecated use isLegacyPrismaPasswordLoginEnabled */
export function isSeededPasswordLoginEnabled(): boolean {
  return isLegacyPrismaPasswordLoginEnabled();
}
