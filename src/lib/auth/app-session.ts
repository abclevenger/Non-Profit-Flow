import type { OrganizationMembershipRole } from "@/lib/organizations/membershipRole";
import type { MemberRole } from "@/lib/auth/roles";
import type { AgencyMembershipRole } from "@/lib/agencies/agencyRole";
import type {
  SessionActiveAgency,
  SessionActiveMembership,
  SessionActiveOrganization,
  SessionAgencySummary,
  SessionOrganizationSummary,
} from "@/lib/auth/sessionOrganizations";

/** Application session shape (replaces NextAuth Session for Supabase OTP auth). */
export type AppSession = {
  user: {
    id: string;
    role: MemberRole;
    agencies: SessionAgencySummary[];
    activeAgencyId: string | null;
    activeAgency: SessionActiveAgency | null;
    agencyMembershipRole: AgencyMembershipRole | null;
    isAgencyOwner: boolean;
    canManageAgency: boolean;
    /** Platform admin: org switcher not filtered by agency. */
    agencyScopeIsAll: boolean;
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
    /** From `User.isDemoUser` — show subtle demo badge; never infer from email in UI. */
    isDemoUser: boolean;
    email: string;
    name?: string | null;
    image?: string | null;
  };
  expires?: string;
};

/** Alias for gradual migration from `import type { Session } from "next-auth"`. */
export type Session = AppSession;
