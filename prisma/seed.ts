import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

/** Must match `OrganizationMembership.role` values in schema / `membershipRole.ts`. */
type SeedOrgRole = "OWNER" | "ADMIN" | "BOARD_CHAIR" | "BOARD_MEMBER" | "STAFF" | "VIEWER";

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

const ROUTING_DEFAULTS = [
  { category: "GENERAL_COUNSEL", displayName: "General Counsel", destinationEmail: "legal@board.demo" },
  { category: "COMPLIANCE", displayName: "Compliance", destinationEmail: "compliance@board.demo" },
  { category: "FUNDRAISING", displayName: "Fundraising", destinationEmail: "fundraising@board.demo" },
  { category: "RECRUITING", displayName: "Recruiting", destinationEmail: "recruiting@board.demo" },
  { category: "TRAINING", displayName: "Training", destinationEmail: "training@board.demo" },
  { category: "OPERATIONS_PROCESS", displayName: "Operations / Process", destinationEmail: "operations@board.demo" },
  { category: "OTHER", displayName: "Other", destinationEmail: "support@board.demo" },
] as const;

const ORGANIZATION_DEFS = [
  {
    slug: "community-outreach",
    name: "Community Outreach Network",
    missionSnippet:
      "Providing local support services and programs to underserved families in the community.",
    demoProfileKey: "communityNonprofit",
    primaryColor: "#5a7d6a",
    industryType: "nonprofit",
    /** When SEED_SUPABASE_TENANT=1 and service role is set, seed Postgres + flip this on. */
    useSupabaseTenantData: process.env.SEED_SUPABASE_TENANT === "1",
  },
  {
    slug: "growing-impact",
    name: "Growing Impact Alliance",
    missionSnippet: "Scaling programs and partnerships across regions while staying mission-true.",
    demoProfileKey: "growingNonprofit",
    primaryColor: "#6b5344",
    industryType: "nonprofit",
    useSupabaseTenantData: false,
  },
  {
    slug: "riverside-academy",
    name: "Riverside Academy Foundation",
    missionSnippet: "Supporting students, families, and faculty through governance-aligned philanthropy.",
    demoProfileKey: "privateSchool",
    primaryColor: "#4a5d8f",
    industryType: "school",
    useSupabaseTenantData: false,
  },
  {
    slug: "legal-aid-collaborative",
    name: "Legal Aid Collaborative",
    missionSnippet: "Expanding access to justice through clinics, pro bono partnerships, and community education.",
    demoProfileKey: "communityNonprofit",
    primaryColor: "#3d5a80",
    industryType: "nonprofit",
    useSupabaseTenantData: false,
  },
  {
    slug: "youth-development-alliance",
    name: "Youth Development Alliance",
    missionSnippet: "Mentorship, after-school programs, and workforce pathways for teens and young adults.",
    demoProfileKey: "growingNonprofit",
    primaryColor: "#6b4f4f",
    industryType: "nonprofit",
    useSupabaseTenantData: false,
  },
] as const;

async function main() {
  const adminEmail = "admin@board.demo";
  const memberEmail = "member@board.demo";
  const guestEmail = "guest@board.demo";
  const adminPass = await hash("BoardAdmin1!z9", 12);
  const memberPass = await hash("MemberPass1!z9", 12);
  const guestPass = await hash("GuestView1!z9", 12);
  const demoTotpSecret = "JBSWY3DPEHPK3PXP";

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      name: "Board Admin",
      passwordHash: adminPass,
      role: "ADMIN",
      isPlatformAdmin: true,
      twoFactorEnabled: true,
      twoFactorSecret: demoTotpSecret,
    },
    update: {
      passwordHash: adminPass,
      role: "ADMIN",
      isPlatformAdmin: true,
      twoFactorEnabled: true,
      twoFactorSecret: demoTotpSecret,
    },
  });

  const memberUser = await prisma.user.upsert({
    where: { email: memberEmail },
    create: {
      email: memberEmail,
      name: "Sample Board Member",
      passwordHash: memberPass,
      role: "BOARD_MEMBER",
      twoFactorEnabled: false,
      twoFactorSecret: null,
    },
    update: {
      passwordHash: memberPass,
      role: "BOARD_MEMBER",
    },
  });

  const guestUser = await prisma.user.upsert({
    where: { email: guestEmail },
    create: {
      email: guestEmail,
      name: "Guest Viewer",
      passwordHash: guestPass,
      role: "GUEST",
      twoFactorEnabled: false,
      twoFactorSecret: null,
    },
    update: {
      passwordHash: guestPass,
      role: "GUEST",
    },
  });

  const orgRows: { id: string; slug: string }[] = [];

  for (const o of ORGANIZATION_DEFS) {
    const org = await prisma.organization.upsert({
      where: { slug: o.slug },
      create: {
        name: o.name,
        slug: o.slug,
        missionSnippet: o.missionSnippet,
        demoProfileKey: o.demoProfileKey,
        demoModeEnabled: true,
        isDemoTenant: true,
        demoEditingEnabled: false,
        useSupabaseTenantData: o.useSupabaseTenantData,
        primaryColor: o.primaryColor,
        secondaryColor: "#5c7a7a",
        accentColor: o.primaryColor,
        industryType: o.industryType,
        onboardingStatus: "ACTIVE",
        billingPlan: "STARTER",
      },
      update: {
        name: o.name,
        missionSnippet: o.missionSnippet,
        demoProfileKey: o.demoProfileKey,
        demoModeEnabled: true,
        isDemoTenant: true,
        useSupabaseTenantData: o.useSupabaseTenantData,
        primaryColor: o.primaryColor,
        industryType: o.industryType,
      },
    });
    orgRows.push({ id: org.id, slug: org.slug });

    await prisma.organizationSettings.upsert({
      where: { organizationId: org.id },
      create: {
        organizationId: org.id,
        themeMode: "light",
        defaultLandingPage: "/overview",
      },
      update: {},
    });

    for (const key of DASHBOARD_MODULE_KEYS) {
      await prisma.organizationModule.upsert({
        where: {
          organizationId_moduleName: { organizationId: org.id, moduleName: key },
        },
        create: {
          organizationId: org.id,
          moduleName: key,
          isEnabled: true,
        },
        update: {},
      });
    }

    for (const row of ROUTING_DEFAULTS) {
      await prisma.issueRoutingRule.upsert({
        where: {
          organizationId_category: { organizationId: org.id, category: row.category },
        },
        create: {
          organizationId: org.id,
          category: row.category,
          displayName: row.displayName,
          destinationEmail: row.destinationEmail,
          isActive: true,
        },
        update: {
          displayName: row.displayName,
        },
      });
    }
  }

  const [community, growing, school, legalAid, youthAlliance] = orgRows;

  const membershipPairs: {
    userId: string;
    organizationId: string;
    role: SeedOrgRole;
  }[] = [
    { userId: adminUser.id, organizationId: community.id, role: "OWNER" },
    { userId: adminUser.id, organizationId: growing.id, role: "OWNER" },
    { userId: adminUser.id, organizationId: school.id, role: "OWNER" },
    { userId: adminUser.id, organizationId: legalAid.id, role: "OWNER" },
    { userId: adminUser.id, organizationId: youthAlliance.id, role: "OWNER" },
    { userId: memberUser.id, organizationId: community.id, role: "BOARD_MEMBER" },
    { userId: memberUser.id, organizationId: growing.id, role: "BOARD_MEMBER" },
    { userId: memberUser.id, organizationId: legalAid.id, role: "BOARD_MEMBER" },
    { userId: guestUser.id, organizationId: community.id, role: "VIEWER" },
  ];

  for (const m of membershipPairs) {
    await prisma.organizationMembership.upsert({
      where: {
        organizationId_userId: { organizationId: m.organizationId, userId: m.userId },
      },
      create: m,
      update: { role: m.role },
    });
  }

  if (process.env.SEED_SUPABASE_TENANT === "1" && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { seedSupabaseTenantForOrganization } = await import("./seed-supabase-tenant");
      await seedSupabaseTenantForOrganization(community.id, true);
    } catch (e) {
      console.warn("Supabase tenant seed skipped or failed:", e);
    }
  }

  console.log("Seed complete (multi-tenant organizations).");
  console.log("Admin:", adminEmail, "/ BoardAdmin1!z9 — platform admin; OWNER on all demo orgs");
  console.log("  2FA (TOTP) secret:", demoTotpSecret);
  console.log("Member:", memberEmail, "/ MemberPass1!z9 — community + growing (BOARD_MEMBER)");
  console.log("Guest:", guestEmail, "/ GuestView1!z9 — community only (VIEWER)");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
