/**
 * Client-only: forgot-password sets this; `/auth/callback` consumes it when `?next=` is missing.
 * Timestamp prevents a stale flag from sending a normal OAuth return to `/reset-password`.
 */
export const PASSWORD_RECOVERY_PENDING_STORAGE_KEY = "npf_password_recovery_pending";

const MAX_AGE_MS = 60 * 60 * 1000; // 1 hour

export function setPasswordRecoveryPending(): void {
  try {
    sessionStorage.setItem(
      PASSWORD_RECOVERY_PENDING_STORAGE_KEY,
      JSON.stringify({ t: Date.now() }),
    );
  } catch {
    /* ignore */
  }
}

/** Returns true once if a recent forgot-password was requested; clears storage. */
export function consumePasswordRecoveryPending(): boolean {
  try {
    const raw = sessionStorage.getItem(PASSWORD_RECOVERY_PENDING_STORAGE_KEY);
    sessionStorage.removeItem(PASSWORD_RECOVERY_PENDING_STORAGE_KEY);
    if (!raw) return false;
    const t = (JSON.parse(raw) as { t?: unknown })?.t;
    if (typeof t !== "number" || !Number.isFinite(t)) return false;
    return Date.now() - t < MAX_AGE_MS;
  } catch {
    try {
      sessionStorage.removeItem(PASSWORD_RECOVERY_PENDING_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    return false;
  }
}
