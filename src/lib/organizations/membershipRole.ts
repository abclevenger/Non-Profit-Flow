import type { MemberRole } from "@/lib/auth/roles";

/**
 * Stored on `OrganizationMembership.role` (SQLite string; mirrors Supabase `organization_members.role`).
 * Maps into UI `MemberRole` via `membershipRoleToMemberRole`.
 */
export const ORG_MEMBERSHIP_ROLES = [
  "OWNER",
  "ADMIN",
  "BOARD_CHAIR",
  "BOARD_MEMBER",
  "EXECUTIVE_DIRECTOR",
  "STAFF",
  "ATTORNEY_ADVISOR",
  "DEMO_USER",
  "VIEWER",
] as const;

export type OrganizationMembershipRole = (typeof ORG_MEMBERSHIP_ROLES)[number];

export function coerceOrgMembershipRole(raw: string): OrganizationMembershipRole {
  if ((ORG_MEMBERSHIP_ROLES as readonly string[]).includes(raw)) {
    return raw as OrganizationMembershipRole;
  }
  return "VIEWER";
}

/** Maps org-scoped role to existing permission matrix (`lib/auth/permissions.ts`). */
export function membershipRoleToMemberRole(role: OrganizationMembershipRole): MemberRole {
  switch (role) {
    case "OWNER":
    case "ADMIN":
      return "ADMIN";
    case "BOARD_CHAIR":
      return "BOARD_CHAIR";
    case "BOARD_MEMBER":
      return "BOARD_MEMBER";
    case "EXECUTIVE_DIRECTOR":
    case "STAFF":
      return "EXECUTIVE_DIRECTOR";
    case "ATTORNEY_ADVISOR":
      return "GENERAL_COUNSEL";
    case "DEMO_USER":
    case "VIEWER":
      return "GUEST";
    default:
      return "BOARD_MEMBER";
  }
}

export function canManageOrgSettings(role: OrganizationMembershipRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function canManageOrgRouting(role: OrganizationMembershipRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function canViewAllExpertReviewsInOrg(role: OrganizationMembershipRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}
