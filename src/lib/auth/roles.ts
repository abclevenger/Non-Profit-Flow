export const MEMBER_ROLES = [
  "ADMIN",
  "BOARD_CHAIR",
  "BOARD_MEMBER",
  "COMMITTEE_MEMBER",
  "EXECUTIVE_DIRECTOR",
  "GUEST",
] as const;

export type MemberRole = (typeof MEMBER_ROLES)[number];

export function isMemberRole(value: string): value is MemberRole {
  return (MEMBER_ROLES as readonly string[]).includes(value);
}

export function isAdminLevelRole(role: MemberRole): boolean {
  return role === "ADMIN" || role === "BOARD_CHAIR";
}

export const ROLE_LABELS: Record<MemberRole, string> = {
  ADMIN: "Admin",
  BOARD_CHAIR: "Board Chair",
  BOARD_MEMBER: "Board Member",
  COMMITTEE_MEMBER: "Committee Member",
  EXECUTIVE_DIRECTOR: "Executive Director / Staff",
  GUEST: "Guest / Viewer",
};