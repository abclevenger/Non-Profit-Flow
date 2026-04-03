import type { OrganizationMembershipRole } from "@/lib/organizations/membershipRole";

/**
 * Human-readable permission badge for the active organization. Title (e.g. Board Chair) is separate on `OrganizationMembership.title`.
 */
export function membershipRoleDisplayLabel(role: OrganizationMembershipRole | null): string {
  if (!role) return "Member";
  if (role === "VIEWER") return "Viewer";
  if (role === "DEMO_USER") return "Demo participant";
  const p = membershipRoleToProductRole(role);
  if (p) return SAAS_PRODUCT_ROLE_LABELS[p];
  return role.replace(/_/g, " ");
}

/**
 * Product-facing role names (stable API / UI copy). Storage uses `OrganizationMembershipRole`
 * strings on `OrganizationMembership.role` (and mirrored Supabase `organization_members.role`).
 */
export const SAAS_PRODUCT_ROLES = [
  "platform_admin",
  "organization_admin",
  "board_chair",
  "board_member",
  "executive_director",
  "staff_member",
  "attorney_advisor",
] as const;

export type SaasProductRole = (typeof SAAS_PRODUCT_ROLES)[number];

export const SAAS_PRODUCT_ROLE_LABELS: Record<SaasProductRole, string> = {
  platform_admin: "Platform administrator",
  organization_admin: "Organization administrator",
  board_chair: "Board chair",
  board_member: "Board member",
  executive_director: "Executive director",
  staff_member: "Staff member",
  attorney_advisor: "Attorney advisor",
};

/** Maps stored membership role to a product role for display (first match wins). */
export function membershipRoleToProductRole(role: OrganizationMembershipRole): SaasProductRole | null {
  switch (role) {
    case "OWNER":
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
    case "VIEWER":
      return null;
    default:
      return null;
  }
}
