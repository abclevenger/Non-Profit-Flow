/**
 * MFA / 2FA readiness (Supabase Auth MFA or custom TOTP).
 *
 * Today: not enforced. When rolling out:
 * - Enable MFA in Supabase Dashboard for elevated identities (or use `User.twoFactorEnabled` in Prisma as policy).
 * - After `signInWithPassword`, check `data.session` / `supabase.auth.mfa.getAuthenticatorAssuranceLevel()`.
 * - Require AAL2 before platform-admin or sensitive mutations.
 */

export const MFA_ENFORCEMENT_ENABLED = false;

/** Future: prompt platform admins to enroll MFA after password sign-in. */
export function shouldPromptMfaEnrollment(isPlatformAdmin: boolean, twoFactorEnabled: boolean): boolean {
  if (!MFA_ENFORCEMENT_ENABLED) return false;
  return isPlatformAdmin && !twoFactorEnabled;
}
