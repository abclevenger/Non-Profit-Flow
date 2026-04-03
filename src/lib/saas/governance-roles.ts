import type { OrganizationMembershipRole } from "@/lib/organizations/membershipRole";

/**
 * Product / API vocabulary for nonprofit governance SaaS (docs + external integrations).
 * Stored in Prisma as `OrganizationMembership.role` (`OrganizationMembershipRole`) and
 * platform scope on `User.isPlatformAdmin`.
 */
export const SAAS_GOVERNANCE_PRODUCT_ROLES = [
  "platform_admin",
  "organization_admin",
  "board_chair",
  "board_member",
  "executive_director",
  "staff_member",
  "attorney_advisor",
] as const;

export type SaasGovernanceProductRole = (typeof SAAS_GOVERNANCE_PRODUCT_ROLES)[number];

/** Maps marketing / spec role strings to persisted `OrganizationMembership.role`. */
export function organizationMembershipRoleFromProductSpec(
  spec: string,
): OrganizationMembershipRole | null {
  const key = spec.trim().toLowerCase().replace(/-/g, "_");
  switch (key) {
    case "platform_admin":
      return "PLATFORM_ADMIN";
    case "organization_admin":
      return "ADMIN";
    case "board_chair":
      return "BOARD_CHAIR";
    case "board_member":
      return "BOARD_MEMBER";
    case "executive_director":
      return "EXECUTIVE_DIRECTOR";
    case "staff_member":
      return "STAFF";
    case "attorney_advisor":
      return "ATTORNEY_ADVISOR";
    default:
      return null;
  }
}

/** Inverse: storage → product label (for exports and admin CSV). */
export function productSpecFromOrganizationMembershipRole(
  role: OrganizationMembershipRole,
): SaasGovernanceProductRole | "demo_user" | "viewer" | "owner" {
  switch (role) {
    case "PLATFORM_ADMIN":
      return "platform_admin";
    case "OWNER":
      return "owner";
    case "ADMIN":
      return "organization_admin";
    case "BOARD_CHAIR":
      return "board_chair";
    case "BOARD_MEMBER":
      return "board_member";
    case "EXECUTIVE_DIRECTOR":
      return "executive_director";
    case "STAFF":
      return "staff_member";
    case "ATTORNEY_ADVISOR":
      return "attorney_advisor";
    case "DEMO_USER":
      return "demo_user";
    case "VIEWER":
      return "viewer";
    default:
      return "viewer";
  }
}
