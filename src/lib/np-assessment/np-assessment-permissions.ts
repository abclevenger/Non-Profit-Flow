import type { OrganizationMembershipRole } from "@/lib/organizations/membershipRole";

export type NpAssessmentAction =
  | "create"
  | "fill"
  | "submit"
  | "archive"
  | "view_report"
  | "export"
  | "review_flagged";

/**
 * Hub lists assessments and links to report / take — broader than `fill` alone
 * (e.g. attorneys may review flagged items via report, not the wizard).
 */
export function canAccessAssessmentHub(
  role: OrganizationMembershipRole | null,
  isPlatformAdmin: boolean,
): boolean {
  if (isPlatformAdmin) return true;
  if (!role) return false;
  return (
    canPerformNpAssessmentAction(role, false, "create") ||
    canPerformNpAssessmentAction(role, false, "fill") ||
    canPerformNpAssessmentAction(role, false, "view_report")
  );
}

/** Attorneys do not use the response wizard; they use completed reports / flagged lists. */
export function canFillNpAssessmentWizard(
  role: OrganizationMembershipRole | null,
  isPlatformAdmin: boolean,
  allowBoardMemberFill: boolean,
): boolean {
  if (isPlatformAdmin) return true;
  if (!role || role === "VIEWER") return false;
  if (role === "ATTORNEY_ADVISOR") return false;
  if (role === "BOARD_MEMBER" && !allowBoardMemberFill) return false;
  return (
    role === "OWNER" ||
    role === "ADMIN" ||
    role === "BOARD_CHAIR" ||
    role === "BOARD_MEMBER" ||
    role === "EXECUTIVE_DIRECTOR" ||
    role === "STAFF" ||
    role === "DEMO_USER"
  );
}

export function canPerformNpAssessmentAction(
  role: OrganizationMembershipRole | null,
  isPlatformAdmin: boolean,
  action: NpAssessmentAction,
): boolean {
  if (isPlatformAdmin) return true;
  if (!role) return false;

  switch (action) {
    case "create":
    case "archive":
      return role === "OWNER" || role === "ADMIN";
    case "submit":
      return role === "OWNER" || role === "ADMIN" || role === "BOARD_CHAIR";
    case "fill":
      /* Coarse check (e.g. nav); per-assessment use `canFillNpAssessmentWizard(..., allowBoardMemberFill)`. */
      return canFillNpAssessmentWizard(role, false, true);
    case "view_report":
    case "export":
    case "review_flagged":
      return role !== "VIEWER";
    default:
      return false;
  }
}

/** Normalize legacy Prisma assessment status values. */
export function normalizeAssessmentStatus(raw: string): "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED" {
  if (raw === "ARCHIVED") return "ARCHIVED";
  if (raw === "COMPLETED" || raw === "SUBMITTED") return "COMPLETED";
  if (raw === "IN_PROGRESS") return "IN_PROGRESS";
  if (raw === "NOT_STARTED" || raw === "DRAFT") return "NOT_STARTED";
  return "NOT_STARTED";
}

/** UI label: treat pre-save state as Draft. */
export function assessmentStatusUiLabel(raw: string): string {
  const s = normalizeAssessmentStatus(raw);
  if (s === "NOT_STARTED") return "Draft";
  if (s === "IN_PROGRESS") return "In progress";
  if (s === "COMPLETED") return "Completed";
  if (s === "ARCHIVED") return "Archived";
  return raw;
}
