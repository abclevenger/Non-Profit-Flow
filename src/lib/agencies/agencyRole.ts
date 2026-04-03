import type { OrganizationMembershipRole } from "@/lib/organizations/membershipRole";

/** Stored on `AgencyMember.role`. */
export const AGENCY_MEMBERSHIP_ROLES = ["AGENCY_ADMIN", "AGENCY_STAFF"] as const;

export type AgencyMembershipRole = (typeof AGENCY_MEMBERSHIP_ROLES)[number];

export function coerceAgencyMembershipRole(raw: string): AgencyMembershipRole {
  const u = raw.trim().toUpperCase();
  if (u === "AGENCY_ADMIN") return "AGENCY_ADMIN";
  return "AGENCY_STAFF";
}

/** Owner + agency admin can manage agency-level operations (orgs under agency, billing hooks, etc.). */
export function canManageAgencyOperations(
  role: AgencyMembershipRole | null,
  isOwner: boolean,
): boolean {
  return isOwner || role === "AGENCY_ADMIN";
}

/**
 * When opening a nonprofit workspace via agency seat (no `OrganizationMembership`), use a safe
 * synthetic org role: staff-like for admins, read-mostly for agency staff.
 */
export function syntheticOrgRoleForAgencySeat(
  seat: "OWNER" | "AGENCY_ADMIN" | "AGENCY_STAFF",
): OrganizationMembershipRole {
  if (seat === "AGENCY_STAFF") return "VIEWER";
  return "STAFF";
}

export type AgencySeatKind = "OWNER" | "AGENCY_ADMIN" | "AGENCY_STAFF";
