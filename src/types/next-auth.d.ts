import type { DefaultSession } from "next-auth";
import type { OrganizationMembershipRole } from "@/lib/organizations/membershipRole";
import type { MemberRole } from "@/lib/auth/roles";
import type {
  SessionActiveOrganization,
  SessionOrganizationSummary,
} from "@/lib/auth/sessionOrganizations";

declare module "next-auth" {
  interface User {
    role?: MemberRole;
  }
  interface Session {
    user: {
      id: string;
      /** Effective role for the active organization (from membership). */
      role: MemberRole;
      organizations: SessionOrganizationSummary[];
      activeOrganizationId: string | null;
      activeOrganization: SessionActiveOrganization | null;
      membershipRole: OrganizationMembershipRole | null;
      canManageOrganizationSettings: boolean;
      canManageIssueRouting: boolean;
      canViewAllExpertReviewsInOrg: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: MemberRole;
    activeOrganizationId?: string | null;
  }
}
