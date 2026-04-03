/**
 * SaaS governance demo: platform owner, three nonprofits, realistic memberships.
 * Run after base schema exists:
 *   npx prisma db push
 *   npx tsx prisma/seed-governance-saas.ts
 * Or: npm run db:seed:saas
 *
 * Auth: users sign in via Supabase (OTP/OAuth). This script only creates Prisma rows;
 * on first login, `get-app-auth` links `User.supabaseAuthId`.
 */
import { PrismaClient } from "@prisma/client";
import { defaultExtendedSettings } from "../src/lib/organization-settings/extended-settings";
import type { OrganizationMembershipRole } from "../src/lib/organizations/membershipRole";

const prisma = new PrismaClient();

const DASHBOARD_MODULE_KEYS = [
  "STRATEGY",
  "GOVERNANCE",
  "RISKS",
  "MEETINGS",
  "MINUTES",
  "VOTING",
  "TRAINING",
  "DOCUMENTS",
] as const;

type AgencyKey = "main" | "law";

const ORGANIZATION_DEFS = [
  {
    slug: "community-outreach",
    agencyKey: "main" as const,
    name: "Community Outreach Network",
    missionSnippet:
      "Providing local support services and programs to underserved families in the community.",
    demoProfileKey: "communityNonprofit",
    primaryColor: "#5a7d6a",
    industryType: "nonprofit",
  },
  {
    slug: "youth-development-alliance",
    agencyKey: "main" as const,
    name: "Youth Development Alliance",
    missionSnippet: "Mentorship, after-school programs, and workforce pathways for teens and young adults.",
    demoProfileKey: "growingNonprofit",
    primaryColor: "#6b4f4f",
    industryType: "nonprofit",
  },
  {
    slug: "legal-aid-collaborative",
    agencyKey: "law" as const,
    name: "Legal Aid Collaborative",
    missionSnippet: "Expanding access to justice through clinics, pro bono partnerships, and community education.",
    demoProfileKey: "communityNonprofit",
    primaryColor: "#3d5a80",
    industryType: "nonprofit",
  },
  {
    slug: "justice-corps-clinic",
    agencyKey: "law" as const,
    name: "Justice Corps Clinic",
    missionSnippet: "Neighborhood legal clinic and intake under the firm’s white-label nonprofit program.",
    demoProfileKey: "communityNonprofit",
    primaryColor: "#2c5282",
    industryType: "nonprofit",
  },
] as const;

type SeedUser = {
  email: string;
  name: string;
  fullName: string;
  isPlatformAdmin?: boolean;
  allowDemoOrganizationAssignment?: boolean;
  profile?: { phone?: string; timezone?: string; avatarUrl?: string | null; jobTitle?: string | null };
};

const SEED_USERS: SeedUser[] = [
  {
    email: "ashley@ymbs.pro",
    name: "Ashley Clevenger",
    fullName: "Ashley Clevenger",
    isPlatformAdmin: true,
    allowDemoOrganizationAssignment: true,
    profile: { timezone: "America/New_York", jobTitle: "Managing Director" },
  },
  {
    email: "ed@community.org",
    name: "Jordan Ellis",
    fullName: "Jordan Ellis",
    profile: { phone: "+1-555-0101", timezone: "America/Chicago", jobTitle: "Executive Director" },
  },
  {
    email: "chair@community.org",
    name: "Riley Chen",
    fullName: "Riley Chen",
    profile: { jobTitle: "Board Chair" },
  },
  {
    email: "board1@community.org",
    name: "Sam Rivera",
    fullName: "Sam Rivera",
    profile: { jobTitle: "Board Member" },
  },
  {
    email: "board2@community.org",
    name: "Taylor Brooks",
    fullName: "Taylor Brooks",
    profile: { jobTitle: "Board Member" },
  },
  {
    email: "staff@community.org",
    name: "Casey Morgan",
    fullName: "Casey Morgan",
    profile: { jobTitle: "Operations Manager" },
  },
  {
    email: "legal@firm.com",
    name: "Morgan Blake",
    fullName: "Morgan Blake, Esq.",
    profile: { phone: "+1-555-0199", timezone: "America/New_York", jobTitle: "Outside Counsel" },
  },
  {
    email: "director@legalaid.org",
    name: "Avery Singh",
    fullName: "Avery Singh",
    profile: { jobTitle: "Executive Director" },
  },
  {
    email: "lead@youthalliance.org",
    name: "Jamie Foster",
    fullName: "Jamie Foster",
    profile: { jobTitle: "Program Director" },
  },
];

type OrgSlug = (typeof ORGANIZATION_DEFS)[number]["slug"];

type MembershipSeed = {
  email: string;
  orgSlug: OrgSlug;
  role: OrganizationMembershipRole;
  title: string | null;
};

const MEMBERSHIPS: MembershipSeed[] = [
  { email: "ashley@ymbs.pro", orgSlug: "community-outreach", role: "PLATFORM_ADMIN", title: "Platform operator" },
  { email: "ashley@ymbs.pro", orgSlug: "youth-development-alliance", role: "PLATFORM_ADMIN", title: "Platform operator" },
  { email: "ashley@ymbs.pro", orgSlug: "legal-aid-collaborative", role: "PLATFORM_ADMIN", title: "Platform operator" },
  { email: "ashley@ymbs.pro", orgSlug: "justice-corps-clinic", role: "PLATFORM_ADMIN", title: "Platform operator" },
  { email: "ed@community.org", orgSlug: "community-outreach", role: "EXECUTIVE_DIRECTOR", title: "Executive Director" },
  { email: "chair@community.org", orgSlug: "community-outreach", role: "BOARD_CHAIR", title: "Board Chair" },
  { email: "board1@community.org", orgSlug: "community-outreach", role: "BOARD_MEMBER", title: "Board Member" },
  { email: "board2@community.org", orgSlug: "community-outreach", role: "BOARD_MEMBER", title: "Treasurer" },
  { email: "staff@community.org", orgSlug: "community-outreach", role: "STAFF", title: "Operations Manager" },
  { email: "legal@firm.com", orgSlug: "community-outreach", role: "ATTORNEY_ADVISOR", title: "Outside Counsel" },
  { email: "legal@firm.com", orgSlug: "legal-aid-collaborative", role: "ATTORNEY_ADVISOR", title: "Pro Bono Partner" },
  { email: "director@legalaid.org", orgSlug: "legal-aid-collaborative", role: "ADMIN", title: "Executive Director" },
  { email: "director@legalaid.org", orgSlug: "justice-corps-clinic", role: "BOARD_CHAIR", title: "Clinic Director" },
  { email: "lead@youthalliance.org", orgSlug: "youth-development-alliance", role: "EXECUTIVE_DIRECTOR", title: "Program Director" },
];

type AgencyMemberSeed = { email: string; agencyKey: AgencyKey; role: "AGENCY_ADMIN" | "AGENCY_STAFF" };

const AGENCY_MEMBER_SEEDS: AgencyMemberSeed[] = [
  { email: "ashley@ymbs.pro", agencyKey: "main", role: "AGENCY_ADMIN" },
  { email: "ashley@ymbs.pro", agencyKey: "law", role: "AGENCY_ADMIN" },
  { email: "legal@firm.com", agencyKey: "law", role: "AGENCY_ADMIN" },
  { email: "staff@community.org", agencyKey: "main", role: "AGENCY_STAFF" },
];

async function ensureOrgInfrastructure(orgId: string) {
  const ext = JSON.stringify(defaultExtendedSettings());
  await prisma.organizationSettings.upsert({
    where: { organizationId: orgId },
    create: {
      organizationId: orgId,
      themeMode: "light",
      defaultLandingPage: "/overview",
      extendedSettings: ext,
    },
    update: {},
  });
  for (const key of DASHBOARD_MODULE_KEYS) {
    await prisma.organizationModule.upsert({
      where: { organizationId_moduleName: { organizationId: orgId, moduleName: key } },
      create: { organizationId: orgId, moduleName: key, isEnabled: true },
      update: {},
    });
  }
}

async function main() {
  const userByEmail = new Map<string, { id: string }>();

  for (const u of SEED_USERS) {
    const row = await prisma.user.upsert({
      where: { email: u.email },
      create: {
        email: u.email,
        name: u.name,
        isPlatformAdmin: Boolean(u.isPlatformAdmin),
        allowDemoOrganizationAssignment: Boolean(u.allowDemoOrganizationAssignment),
        role: u.isPlatformAdmin ? "ADMIN" : "BOARD_MEMBER",
      },
      update: {
        name: u.name,
        isPlatformAdmin: Boolean(u.isPlatformAdmin),
        allowDemoOrganizationAssignment: u.allowDemoOrganizationAssignment ?? undefined,
      },
    });
    userByEmail.set(u.email, { id: row.id });

    await prisma.userProfile.upsert({
      where: { userId: row.id },
      create: {
        userId: row.id,
        fullName: u.fullName,
        jobTitle: u.profile?.jobTitle ?? null,
        phone: u.profile?.phone ?? null,
        timezone: u.profile?.timezone ?? null,
        avatarUrl: u.profile?.avatarUrl ?? null,
      },
      update: {
        fullName: u.fullName,
        jobTitle: u.profile?.jobTitle ?? null,
        phone: u.profile?.phone ?? null,
        timezone: u.profile?.timezone ?? null,
        avatarUrl: u.profile?.avatarUrl ?? null,
      },
    });
  }

  const ashleyId = userByEmail.get("ashley@ymbs.pro")?.id;
  const legalOwnerId = userByEmail.get("legal@firm.com")?.id;
  if (!ashleyId || !legalOwnerId) {
    throw new Error("Seed requires ashley@ymbs.pro and legal@firm.com users");
  }

  let mainAgency =
    (await prisma.agency.findFirst({ where: { name: "Community Impact Partners" } })) ??
    (await prisma.agency.create({
      data: {
        name: "Community Impact Partners",
        ownerUserId: ashleyId,
        isWhiteLabel: false,
      },
    }));
  mainAgency = await prisma.agency.update({
    where: { id: mainAgency.id },
    data: { ownerUserId: ashleyId, isWhiteLabel: false },
  });

  let lawAgency =
    (await prisma.agency.findFirst({ where: { name: "Riverside Legal Group LLP" } })) ??
    (await prisma.agency.create({
      data: {
        name: "Riverside Legal Group LLP",
        ownerUserId: legalOwnerId,
        isWhiteLabel: true,
      },
    }));
  lawAgency = await prisma.agency.update({
    where: { id: lawAgency.id },
    data: { ownerUserId: legalOwnerId, isWhiteLabel: true },
  });

  const agencyIdByKey: Record<AgencyKey, string> = {
    main: mainAgency.id,
    law: lawAgency.id,
  };

  const orgBySlug = new Map<string, { id: string }>();

  for (const o of ORGANIZATION_DEFS) {
    const agencyId = agencyIdByKey[o.agencyKey];
    const org = await prisma.organization.upsert({
      where: { slug: o.slug },
      create: {
        agencyId,
        name: o.name,
        slug: o.slug,
        missionSnippet: o.missionSnippet,
        demoProfileKey: o.demoProfileKey,
        demoModeEnabled: true,
        isDemoTenant: true,
        demoEditingEnabled: false,
        primaryColor: o.primaryColor,
        secondaryColor: "#5c7a7a",
        accentColor: o.primaryColor,
        industryType: o.industryType,
        onboardingStatus: "ACTIVE",
        billingPlan: "STARTER",
      },
      update: {
        agencyId,
        name: o.name,
        missionSnippet: o.missionSnippet,
        demoProfileKey: o.demoProfileKey,
        isDemoTenant: true,
        primaryColor: o.primaryColor,
        industryType: o.industryType,
      },
    });
    orgBySlug.set(o.slug, { id: org.id });
    await ensureOrgInfrastructure(org.id);
  }

  for (const row of AGENCY_MEMBER_SEEDS) {
    const uid = userByEmail.get(row.email)?.id;
    const aid = agencyIdByKey[row.agencyKey];
    if (!uid) continue;
    await prisma.agencyMember.upsert({
      where: { agencyId_userId: { agencyId: aid, userId: uid } },
      create: { agencyId: aid, userId: uid, role: row.role, status: "ACTIVE" },
      update: { role: row.role, status: "ACTIVE" },
    });
  }

  for (const m of MEMBERSHIPS) {
    const userId = userByEmail.get(m.email)?.id;
    const orgId = orgBySlug.get(m.orgSlug)?.id;
    if (!userId || !orgId) {
      console.warn("Skip membership (missing user or org):", m);
      continue;
    }
    await prisma.organizationMembership.upsert({
      where: { organizationId_userId: { organizationId: orgId, userId } },
      create: {
        userId,
        organizationId: orgId,
        role: m.role,
        title: m.title,
        status: "ACTIVE",
      },
      update: {
        role: m.role,
        title: m.title,
        status: "ACTIVE",
      },
    });
  }

  console.log("Governance SaaS seed complete.");
  console.log("Platform admin: ashley@ymbs.pro (sign in with Supabase to link auth id)");
  console.log("Agencies: Community Impact Partners (main), Riverside Legal Group LLP (white-label law firm)");
  console.log("Demo orgs:", [...orgBySlug.keys()].join(", "));
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    void prisma.$disconnect();
    process.exit(1);
  });
