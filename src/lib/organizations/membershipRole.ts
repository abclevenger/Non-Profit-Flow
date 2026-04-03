import type { MemberRole } from "@/lib/auth/roles";

/**
 * Stored on `OrganizationMembership.role` (SQLite string; mirrors Supabase `organization_members.role`).
 * Maps into UI `MemberRole` via `membershipRoleToMemberRole`.
 */
export const ORG_MEMBERSHIP_ROLES = [
  /** Agency / master account — full org access without customer org-admin duties in analytics. */
  "PLATFORM_ADMIN",
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

/** Accept alternate API/CSV values; normalized to canonical `OrganizationMembershipRole`. */
const MEMBERSHIP_ROLE_ALIASES: Record<string, OrganizationMembershipRole> = {
  ORGANIZATION_ADMIN: "ADMIN",
  STAFF_MEMBER: "STAFF",
  /** Product / CSV synonym */
  PLATFORM_OPERATOR: "PLATFORM_ADMIN",
};

export function coerceOrgMembershipRole(raw: string): OrganizationMembershipRole {
  const key = raw.trim().toUpperCase();
  const normalized = MEMBERSHIP_ROLE_ALIASES[key] ?? key;
  if ((ORG_MEMBERSHIP_ROLES as readonly string[]).includes(normalized)) {
    return normalized as OrganizationMembershipRole;
  }
  return "VIEWER";
}

/** Maps org-scoped role to existing permission matrix (`lib/auth/permissions.ts`). */
export function membershipRoleToMemberRole(role: OrganizationMembershipRole): MemberRole {
  switch (role) {
    case "PLATFORM_ADMIN":
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
  return role === "PLATFORM_ADMIN" || role === "OWNER" || role === "ADMIN";
}

export function canManageOrgRouting(role: OrganizationMembershipRole): boolean {
  return role === "PLATFORM_ADMIN" || role === "OWNER" || role === "ADMIN";
}

export function canViewAllExpertReviewsInOrg(role: OrganizationMembershipRole): boolean {
  return role === "PLATFORM_ADMIN" || role === "OWNER" || role === "ADMIN";
}
