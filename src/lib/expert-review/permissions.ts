import type { Session } from "@/lib/auth/app-session";
import { isMemberRole } from "@/lib/auth/roles";
import { canFlagForGcReview } from "@/lib/gc-review/permissions";

export function canSubmitExpertReview(role: string | undefined): boolean {
  return canFlagForGcReview(role);
}

export function canViewAllExpertReviews(session: Session | null): boolean {
  return session?.user?.canViewAllExpertReviewsInOrg === true;
}

export function canManageIssueRouting(session: Session | null): boolean {
  return session?.user?.canManageIssueRouting === true;
}

export function canAccessReviewsQueue(role: string | undefined): boolean {
  if (!role || !isMemberRole(role)) return false;
  return role !== "GUEST";
}
