import { isMemberRole } from "@/lib/auth/roles";

/** Board, leadership, coordinators — anyone who can participate beyond view-only. */
export function canFlagForGcReview(role: string | undefined): boolean {
  if (!role || !isMemberRole(role)) return false;
  return role !== "GUEST";
}

export function canAccessGcReviewQueue(role: string | undefined): boolean {
  if (!role || !isMemberRole(role)) return false;
  return role === "ADMIN" || role === "GENERAL_COUNSEL";
}

/** Sensitive GC fields (notes, recommendation, next step). */
export function canViewGcSensitiveFields(role: string | undefined): boolean {
  return canAccessGcReviewQueue(role);
}

export function canUpdateGcReview(role: string | undefined): boolean {
  return canAccessGcReviewQueue(role);
}
