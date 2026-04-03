import { prisma } from "@/lib/prisma";
import {
  DASHBOARD_MODULE_KEYS,
  type DashboardModulesState,
  defaultModulesAllEnabled,
} from "@/lib/organization-settings/modules";
import {
  canManageOrgRouting,
  canManageOrgSettings,
  canViewAllExpertReviewsInOrg as membershipAllowsViewAllExpertReviews,
  coerceOrgMembershipRole,
  membershipRoleToMemberRole,
  type OrganizationMembershipRole,
} from "@/lib/organizations/membershipRole";

export type SessionOrganizationSummary = {
  id: string;
  name: string;
  slug: string;
  demoProfileKey: string | null;
};

export type SessionActiveOrganization = {
  id: string;
  name: string;
  slug: string;
  missionSnippet: string | null;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string | null;
  demoProfileKey: string | null;
  modules: DashboardModulesState;
  themeMode: string;
  defaultLandingPage: string;
};

function modulesFromRows(rows: { moduleName: string; isEnabled: boolean }[]): DashboardModulesState {
  const base = defaultModulesAllEnabled();
  for (const r of rows) {
    const k = r.moduleName as keyof DashboardModulesState;
    if ((DASHBOARD_MODULE_KEYS as readonly string[]).includes(r.moduleName)) {
      base[k] = r.isEnabled;
    }
  }
  return base;
}

export async function loadOrgSessionState(userId: string, preferredOrganizationId: string | null | undefined) {
  const memberships = await prisma.organizationMembership.findMany({
    where: { userId },
    include: {
      organization: {
        include: {
          modules: true,
          settings: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const organizations: SessionOrganizationSummary[] = memberships.map((m) => ({
    id: m.organization.id,
    name: m.organization.name,
    slug: m.organization.slug,
    demoProfileKey: m.organization.demoProfileKey,
  }));

  if (memberships.length === 0) {
    return {
      organizations: [] as SessionOrganizationSummary[],
      activeOrganizationId: null as string | null,
      activeOrganization: null as SessionActiveOrganization | null,
      membershipRole: null as OrganizationMembershipRole | null,
      effectiveMemberRole: membershipRoleToMemberRole("VIEWER"),
      canManageOrganizationSettings: false,
      canManageIssueRouting: false,
      canViewAllExpertReviewsInOrg: false,
    };
  }

  const preferred =
    preferredOrganizationId && memberships.some((m) => m.organizationId === preferredOrganizationId)
      ? preferredOrganizationId
      : memberships[0].organizationId;

  const activeM = memberships.find((m) => m.organizationId === preferred)!;
  const org = activeM.organization;
  const role = coerceOrgMembershipRole(activeM.role);

  const settings = org.settings;
  const activeOrganization: SessionActiveOrganization = {
    id: org.id,
    name: org.name,
    slug: org.slug,
    missionSnippet: org.missionSnippet,
    logoUrl: org.logoUrl,
    primaryColor: org.primaryColor,
    secondaryColor: org.secondaryColor,
    accentColor: org.accentColor,
    demoProfileKey: org.demoProfileKey,
    modules: modulesFromRows(org.modules),
    themeMode: settings?.themeMode ?? "light",
    defaultLandingPage: settings?.defaultLandingPage ?? "/overview",
  };

  return {
    organizations,
    activeOrganizationId: preferred,
    activeOrganization,
    membershipRole: role,
    effectiveMemberRole: membershipRoleToMemberRole(role),
    canManageOrganizationSettings: canManageOrgSettings(role),
    canManageIssueRouting: canManageOrgRouting(role),
    canViewAllExpertReviewsInOrg: membershipAllowsViewAllExpertReviews(role),
  };
}
