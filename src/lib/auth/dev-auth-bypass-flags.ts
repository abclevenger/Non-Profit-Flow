/**
 * Local / preview only: disables Supabase gatekeeping when `DISABLE_APP_AUTH` is truthy.
 * Never honored in production (`NODE_ENV === "production"`).
 */
export function isDevAuthBypassActive(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  const v = process.env.DISABLE_APP_AUTH?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

/** Prisma user email to impersonate (must exist or be creatable); default matches seed admin. */
export function devBypassUserEmail(): string {
  return (process.env.DEV_BYPASS_USER_EMAIL?.trim() || "admin@board.demo").toLowerCase();
}
