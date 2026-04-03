import type { MemberRole } from "@/lib/auth/roles";

export type Permission = "view" | "comment" | "edit" | "vote";

const matrix: Record<MemberRole, Permission[]> = {
  ADMIN: ["view", "comment", "edit", "vote"],
  BOARD_CHAIR: ["view", "comment", "edit", "vote"],
  BOARD_MEMBER: ["view", "comment", "vote"],
  COMMITTEE_MEMBER: ["view", "comment"],
  EXECUTIVE_DIRECTOR: ["view", "comment", "edit"],
  GUEST: ["view"],
};

export function hasPermission(role: MemberRole, permission: Permission): boolean {
  return matrix[role]?.includes(permission) ?? false;
}