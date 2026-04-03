import type { OrganizationMembershipRole } from "@/lib/organizations/membershipRole";
import type { MemberRole } from "@/lib/auth/roles";
import type {
  SessionActiveMembership,
  SessionActiveOrganization,
  SessionOrganizationSummary,
} from "@/lib/auth/sessionOrganizations";

/** Application session shape (replaces NextAuth Session for Supabase OTP auth). */
export type AppSession = {
  user: {
    id: string;
    role: MemberRole;
    organizations: SessionOrganizationSummary[];
    activeOrganizationId: string | null;
    activeOrganization: SessionActiveOrganization | null;
    /** Active org’s `OrganizationMembership` (role = permission; title = display position). */
    activeMembership: SessionActiveMembership | null;
    membershipRole: OrganizationMembershipRole | null;
    canManageOrganizationSettings: boolean;
    canManageIssueRouting: boolean;
    canViewAllExpertReviewsInOrg: boolean;
    isPlatformAdmin: boolean;
    email: string;
    name?: string | null;
    image?: string | null;
  };
  expires?: string;
};

/** Alias for gradual migration from `import type { Session } from "next-auth"`. */
export type Session = AppSession;
