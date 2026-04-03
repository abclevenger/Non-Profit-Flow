import type { OrganizationMembershipRole } from "@/lib/organizations/membershipRole";

export type NpAssessmentAction = "create" | "fill" | "submit" | "archive" | "view_report" | "export";

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
      return (
        role === "OWNER" ||
        role === "ADMIN" ||
        role === "BOARD_CHAIR" ||
        role === "BOARD_MEMBER" ||
        role === "EXECUTIVE_DIRECTOR" ||
        role === "STAFF" ||
        role === "ATTORNEY_ADVISOR" ||
        role === "DEMO_USER"
      );
    case "view_report":
    case "export":
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
