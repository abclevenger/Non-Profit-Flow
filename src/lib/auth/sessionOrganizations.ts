import { prisma } from "@/lib/prisma";
import {
  canManageAgencyOperations,
  coerceAgencyMembershipRole,
  syntheticOrgRoleForAgencySeat,
  type AgencyMembershipRole,
  type AgencySeatKind,
} from "@/lib/agencies/agencyRole";
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
import {
  coerceMembershipStatus,
  type OrganizationMembershipStatus,
} from "@/lib/organizations/membership-status";
import type { MemberRole } from "@/lib/auth/roles";
import { ALL_AGENCIES_COOKIE_VALUE } from "@/lib/auth/workspace-constants";

export type SessionAgencySummary = {
  id: string;
  name: string;
  isWhiteLabel: boolean;
  agencyMembershipRole: AgencyMembershipRole | null;
  isOwner: boolean;
  canManageAgency: boolean;
};

export type SessionActiveAgency = {
  id: string;
  name: string;
  isWhiteLabel: boolean;
};

export type SessionOrganizationSummary = {
  id: string;
  name: string;
  slug: string;
  agencyId: string;
  agencyName: string;
  demoProfileKey: string | null;
  isDemoTenant: boolean;
  useSupabaseTenantData: boolean;
  membershipRole: OrganizationMembershipRole;
  membershipTitle: string | null;
  membershipStatus: OrganizationMembershipStatus;
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
  isDemoTenant: boolean;
  demoEditingEnabled: boolean;
  useSupabaseTenantData: boolean;
  modules: DashboardModulesState;
  themeMode: string;
  defaultLandingPage: string;
};

export type SessionActiveMembership = {
  role: OrganizationMembershipRole;
  title: string | null;
  status: OrganizationMembershipStatus;
};

export type WorkspaceSessionState = {
  agencies: SessionAgencySummary[];
  /** `null` when platform admin is in “all agencies” scope. */
  activeAgencyId: string | null;
  activeAgency: SessionActiveAgency | null;
  agencyMembershipRole: AgencyMembershipRole | null;
  isAgencyOwner: boolean;
  canManageAgency: boolean;
  /** Platform admin with no agency filter — org switcher lists every organization. */
  agencyScopeIsAll: boolean;
  organizations: SessionOrganizationSummary[];
  activeOrganizationId: string | null;
  activeOrganization: SessionActiveOrganization | null;
  activeMembership: SessionActiveMembership | null;
  membershipRole: OrganizationMembershipRole | null;
  effectiveMemberRole: MemberRole;
  canManageOrganizationSettings: boolean;
  canManageIssueRouting: boolean;
  canViewAllExpertReviewsInOrg: boolean;
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

type OrgWithModules = {
  id: string;
  name: string;
  slug: string;
  agencyId: string;
  missionSnippet: string | null;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string | null;
  demoProfileKey: string | null;
  isDemoTenant: boolean;
  demoEditingEnabled: boolean;
  useSupabaseTenantData: boolean;
  modules: { moduleName: string; isEnabled: boolean }[];
  settings: { themeMode: string; defaultLandingPage: string } | null;
  agency: { id: string; name: string; isWhiteLabel: boolean };
};

function sessionActiveOrganizationFromOrg(org: OrgWithModules): SessionActiveOrganization {
  const settings = org.settings;
  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    missionSnippet: org.missionSnippet,
    logoUrl: org.logoUrl,
    primaryColor: org.primaryColor,
    secondaryColor: org.secondaryColor,
    accentColor: org.accentColor,
    demoProfileKey: org.demoProfileKey,
    isDemoTenant: org.isDemoTenant,
    demoEditingEnabled: org.demoEditingEnabled,
    useSupabaseTenantData: org.useSupabaseTenantData,
    modules: modulesFromRows(org.modules),
    themeMode: settings?.themeMode ?? "light",
    defaultLandingPage: settings?.defaultLandingPage ?? "/overview",
  };
}

function emptyWorkspaceState(): WorkspaceSessionState {
  return {
    agencies: [],
    activeAgencyId: null,
    activeAgency: null,
    agencyMembershipRole: null,
    isAgencyOwner: false,
    canManageAgency: false,
    agencyScopeIsAll: false,
    organizations: [],
    activeOrganizationId: null,
    activeOrganization: null,
    activeMembership: null,
    membershipRole: null,
    effectiveMemberRole: membershipRoleToMemberRole("VIEWER"),
    canManageOrganizationSettings: false,
    canManageIssueRouting: false,
    canViewAllExpertReviewsInOrg: false,
  };
}

export type LoadOrgSessionOptions = {
  isPlatformAdmin?: boolean;
  preferredAgencyId?: string | null;
};

/**
 * Platform → agencies → organizations → members. Merges direct org memberships with agency-wide
 * access (admin/staff) and platform operator scope.
 */
export async function loadOrgSessionState(
  userId: string,
  preferredOrganizationId: string | null | undefined,
  options?: LoadOrgSessionOptions,
): Promise<WorkspaceSessionState> {
  const isPlatformAdmin = Boolean(options?.isPlatformAdmin);
  const preferredAgencyCookie = options?.preferredAgencyId ?? null;

  const memberships = await prisma.organizationMembership.findMany({
    where: { userId, status: "ACTIVE" },
    include: {
      organization: {
        include: {
          modules: true,
          settings: true,
          agency: { select: { id: true, name: true, isWhiteLabel: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const orgMap = new Map<string, SessionOrganizationSummary>();

  const toSummaryFromMembership = (m: (typeof memberships)[number]): SessionOrganizationSummary => ({
    id: m.organization.id,
    name: m.organization.name,
    slug: m.organization.slug,
    agencyId: m.organization.agencyId,
    agencyName: m.organization.agency.name,
    demoProfileKey: m.organization.demoProfileKey,
    isDemoTenant: m.organization.isDemoTenant,
    useSupabaseTenantData: m.organization.useSupabaseTenantData,
    membershipRole: coerceOrgMembershipRole(m.role),
    membershipTitle: m.title?.trim() || null,
    membershipStatus: coerceMembershipStatus(m.status),
  });

  for (const m of memberships) {
    orgMap.set(m.organizationId, toSummaryFromMembership(m));
  }

  type InternalAgency = SessionAgencySummary;
  const agenciesMap = new Map<string, InternalAgency>();

  const ownedAgencies = await prisma.agency.findMany({
    where: { ownerUserId: userId },
    select: { id: true, name: true, isWhiteLabel: true },
  });
  for (const a of ownedAgencies) {
    agenciesMap.set(a.id, {
      id: a.id,
      name: a.name,
      isWhiteLabel: a.isWhiteLabel,
      agencyMembershipRole: "AGENCY_ADMIN",
      isOwner: true,
      canManageAgency: true,
    });
  }

  const agencyMemberRows = await prisma.agencyMember.findMany({
    where: { userId, status: "ACTIVE" },
    include: { agency: { select: { id: true, name: true, isWhiteLabel: true } } },
  });
  for (const row of agencyMemberRows) {
    const role = coerceAgencyMembershipRole(row.role);
    const existing = agenciesMap.get(row.agencyId);
    const canManage = canManageAgencyOperations(role, false);
    if (!existing) {
      agenciesMap.set(row.agencyId, {
        id: row.agency.id,
        name: row.agency.name,
        isWhiteLabel: row.agency.isWhiteLabel,
        agencyMembershipRole: role,
        isOwner: false,
        canManageAgency: canManage,
      });
    } else if (!existing.isOwner) {
      agenciesMap.set(row.agencyId, {
        ...existing,
        agencyMembershipRole: role,
        canManageAgency: canManageAgencyOperations(role, existing.isOwner),
      });
    }
  }

  if (isPlatformAdmin) {
    const allAgencies = await prisma.agency.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, isWhiteLabel: true },
    });
    for (const a of allAgencies) {
      if (!agenciesMap.has(a.id)) {
        agenciesMap.set(a.id, {
          id: a.id,
          name: a.name,
          isWhiteLabel: a.isWhiteLabel,
          agencyMembershipRole: null,
          isOwner: false,
          canManageAgency: true,
        });
      }
    }
  }

  for (const o of orgMap.values()) {
    if (agenciesMap.has(o.agencyId)) continue;
    const a = await prisma.agency.findUnique({
      where: { id: o.agencyId },
      select: { id: true, name: true, isWhiteLabel: true },
    });
    if (a) {
      agenciesMap.set(a.id, {
        id: a.id,
        name: a.name,
        isWhiteLabel: a.isWhiteLabel,
        agencyMembershipRole: null,
        isOwner: false,
        canManageAgency: false,
      });
    }
  }

  const canExpandAgency = (ag: InternalAgency) =>
    isPlatformAdmin || ag.isOwner || ag.agencyMembershipRole === "AGENCY_ADMIN" || ag.agencyMembershipRole === "AGENCY_STAFF";

  if (isPlatformAdmin) {
    const allOrgs = await prisma.organization.findMany({
      orderBy: { name: "asc" },
      include: { agency: { select: { id: true, name: true, isWhiteLabel: true } } },
    });
    for (const o of allOrgs) {
      if (orgMap.has(o.id)) continue;
      orgMap.set(o.id, {
        id: o.id,
        name: o.name,
        slug: o.slug,
        agencyId: o.agencyId,
        agencyName: o.agency.name,
        demoProfileKey: o.demoProfileKey,
        isDemoTenant: o.isDemoTenant,
        useSupabaseTenantData: o.useSupabaseTenantData,
        membershipRole: "PLATFORM_ADMIN",
        membershipTitle: null,
        membershipStatus: "ACTIVE",
      });
    }
  } else {
    for (const ag of agenciesMap.values()) {
      if (!canExpandAgency(ag)) continue;
      const seat: AgencySeatKind = ag.isOwner ? "OWNER" : ag.agencyMembershipRole === "AGENCY_STAFF" ? "AGENCY_STAFF" : "AGENCY_ADMIN";
      const orgsInAgency = await prisma.organization.findMany({
        where: { agencyId: ag.id },
        include: { agency: { select: { id: true, name: true, isWhiteLabel: true } } },
        orderBy: { name: "asc" },
      });
      for (const o of orgsInAgency) {
        if (orgMap.has(o.id)) continue;
        orgMap.set(o.id, {
          id: o.id,
          name: o.name,
          slug: o.slug,
          agencyId: o.agencyId,
          agencyName: o.agency.name,
          demoProfileKey: o.demoProfileKey,
          isDemoTenant: o.isDemoTenant,
          useSupabaseTenantData: o.useSupabaseTenantData,
          membershipRole: syntheticOrgRoleForAgencySeat(seat),
          membershipTitle: null,
          membershipStatus: "ACTIVE",
        });
      }
    }
  }

  const agencies = [...agenciesMap.values()].sort((a, b) => a.name.localeCompare(b.name));
  const organizations = [...orgMap.values()].sort((a, b) => {
    const an = a.agencyName.localeCompare(b.agencyName);
    if (an !== 0) return an;
    return a.name.localeCompare(b.name);
  });

  if (organizations.length === 0) {
    return emptyWorkspaceState();
  }

  const agencyIdsValid = new Set(agencies.map((a) => a.id));

  let agencyScopeIsAll = false;
  let activeAgencyId: string | null = null;

  if (isPlatformAdmin) {
    if (
      !preferredAgencyCookie ||
      preferredAgencyCookie === ALL_AGENCIES_COOKIE_VALUE ||
      !agencyIdsValid.has(preferredAgencyCookie)
    ) {
      agencyScopeIsAll = true;
      activeAgencyId = null;
    } else {
      activeAgencyId = preferredAgencyCookie;
    }
  } else {
    if (preferredAgencyCookie && agencyIdsValid.has(preferredAgencyCookie)) {
      activeAgencyId = preferredAgencyCookie;
    } else {
      activeAgencyId = agencies[0]?.id ?? null;
    }
  }

  const orgInAgencyScope = (o: SessionOrganizationSummary) => {
    if (agencyScopeIsAll) return true;
    if (!activeAgencyId) return true;
    return o.agencyId === activeAgencyId;
  };

  const scopedOrgs = organizations.filter(orgInAgencyScope);
  const orgIdsScoped = new Set(scopedOrgs.map((o) => o.id));

  let preferredOrg: string | null;
  const cookieInScope =
    Boolean(preferredOrganizationId) &&
    orgMap.has(preferredOrganizationId!) &&
    orgIdsScoped.has(preferredOrganizationId!);
  const cookieOrgSummary = cookieInScope ? orgMap.get(preferredOrganizationId!)! : null;
  /** Platform admins must not “resume” a demo org via cookie; choose a real tenant or hub mode. */
  const useCookieForActiveOrg = Boolean(cookieOrgSummary && (!isPlatformAdmin || !cookieOrgSummary.isDemoTenant));

  if (
    process.env.NODE_ENV === "development" &&
    isPlatformAdmin &&
    cookieInScope &&
    cookieOrgSummary?.isDemoTenant &&
    !useCookieForActiveOrg
  ) {
    console.info("[workspace] platform-admin: skip demo org cookie", { preferredOrganizationId });
  }

  if (cookieInScope && useCookieForActiveOrg) {
    preferredOrg = preferredOrganizationId!;
  } else if (isPlatformAdmin) {
    preferredOrg = scopedOrgs.find((o) => !o.isDemoTenant)?.id ?? null;
  } else {
    preferredOrg = scopedOrgs[0]?.id ?? organizations[0]!.id;
  }

  if (isPlatformAdmin && preferredOrg === null) {
    const activeAgencySummary = activeAgencyId ? agenciesMap.get(activeAgencyId) ?? null : null;
    return {
      agencies,
      activeAgencyId,
      activeAgency:
        activeAgencyId && activeAgencySummary
          ? {
              id: activeAgencySummary.id,
              name: activeAgencySummary.name,
              isWhiteLabel: activeAgencySummary.isWhiteLabel,
            }
          : null,
      agencyMembershipRole: activeAgencySummary?.agencyMembershipRole ?? null,
      isAgencyOwner: activeAgencySummary?.isOwner ?? false,
      canManageAgency: true,
      agencyScopeIsAll,
      organizations,
      activeOrganizationId: null,
      activeOrganization: null,
      activeMembership: null,
      membershipRole: "PLATFORM_ADMIN",
      effectiveMemberRole: membershipRoleToMemberRole("PLATFORM_ADMIN"),
      canManageOrganizationSettings: true,
      canManageIssueRouting: true,
      canViewAllExpertReviewsInOrg: true,
    };
  }

  const activeAgencySummary = activeAgencyId ? agenciesMap.get(activeAgencyId) ?? null : null;
  const activeAgency: SessionActiveAgency | null =
    activeAgencyId && activeAgencySummary
      ? {
          id: activeAgencySummary.id,
          name: activeAgencySummary.name,
          isWhiteLabel: activeAgencySummary.isWhiteLabel,
        }
      : null;

  const agencyMembershipRole = activeAgencySummary?.agencyMembershipRole ?? null;
  const isAgencyOwner = activeAgencySummary?.isOwner ?? false;
  const canManageAgency =
    isPlatformAdmin || (activeAgencySummary ? activeAgencySummary.canManageAgency : false);

  const resolveActive = async (
    orgId: string,
  ): Promise<{
    activeOrganization: SessionActiveOrganization;
    activeMembership: SessionActiveMembership;
    role: OrganizationMembershipRole;
  } | null> => {
    const row = memberships.find((m) => m.organizationId === orgId);
    if (row) {
      const role = coerceOrgMembershipRole(row.role);
      return {
        activeOrganization: sessionActiveOrganizationFromOrg(row.organization as OrgWithModules),
        activeMembership: {
          role,
          title: row.title?.trim() || null,
          status: coerceMembershipStatus(row.status),
        },
        role,
      };
    }
    const summary = orgMap.get(orgId);
    if (isPlatformAdmin) {
      const org = await prisma.organization.findUnique({
        where: { id: orgId },
        include: { modules: true, settings: true, agency: { select: { id: true, name: true, isWhiteLabel: true } } },
      });
      if (!org) return null;
      return {
        activeOrganization: sessionActiveOrganizationFromOrg(org as OrgWithModules),
        activeMembership: { role: "PLATFORM_ADMIN", title: null, status: "ACTIVE" },
        role: "PLATFORM_ADMIN",
      };
    }
    if (summary) {
      const org = await prisma.organization.findUnique({
        where: { id: orgId },
        include: { modules: true, settings: true, agency: { select: { id: true, name: true, isWhiteLabel: true } } },
      });
      if (!org) return null;
      const role = summary.membershipRole;
      return {
        activeOrganization: sessionActiveOrganizationFromOrg(org as OrgWithModules),
        activeMembership: { role, title: null, status: "ACTIVE" },
        role,
      };
    }
    return null;
  };

  let effectiveOrgId: string = preferredOrg!;
  let resolved = await resolveActive(effectiveOrgId);
  if (!resolved) {
    if (isPlatformAdmin) {
      const alt = scopedOrgs.find((o) => !o.isDemoTenant)?.id;
      if (alt) {
        effectiveOrgId = alt;
        resolved = await resolveActive(effectiveOrgId);
      }
    }
    if (!resolved && !isPlatformAdmin) {
      effectiveOrgId = organizations[0]!.id;
      resolved = await resolveActive(effectiveOrgId);
    }
  }
  if (!resolved) {
    if (isPlatformAdmin) {
      return {
        agencies,
        activeAgencyId,
        activeAgency,
        agencyMembershipRole,
        isAgencyOwner,
        canManageAgency: true,
        agencyScopeIsAll,
        organizations,
        activeOrganizationId: null,
        activeOrganization: null,
        activeMembership: null,
        membershipRole: "PLATFORM_ADMIN",
        effectiveMemberRole: membershipRoleToMemberRole("PLATFORM_ADMIN"),
        canManageOrganizationSettings: true,
        canManageIssueRouting: true,
        canViewAllExpertReviewsInOrg: true,
      };
    }
    return emptyWorkspaceState();
  }

  const { activeOrganization, activeMembership, role } = resolved;

  return {
    agencies,
    activeAgencyId,
    activeAgency,
    agencyMembershipRole,
    isAgencyOwner,
    canManageAgency,
    agencyScopeIsAll,
    organizations,
    activeOrganizationId: effectiveOrgId,
    activeOrganization,
    activeMembership,
    membershipRole: role,
    effectiveMemberRole: membershipRoleToMemberRole(role),
    canManageOrganizationSettings: canManageOrgSettings(role) || isPlatformAdmin,
    canManageIssueRouting: canManageOrgRouting(role) || isPlatformAdmin,
    canViewAllExpertReviewsInOrg: membershipAllowsViewAllExpertReviews(role) || isPlatformAdmin,
  };
}
