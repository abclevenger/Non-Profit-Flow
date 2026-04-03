export const ORG_MEMBERSHIP_STATUSES = ["ACTIVE", "INACTIVE"] as const;
export type OrganizationMembershipStatus = (typeof ORG_MEMBERSHIP_STATUSES)[number];

export function coerceMembershipStatus(raw: string | null | undefined): OrganizationMembershipStatus {
  if (raw === "INACTIVE") return "INACTIVE";
  return "ACTIVE";
}

export function isActiveMembershipStatus(status: string | null | undefined): boolean {
  return coerceMembershipStatus(status) === "ACTIVE";
}
