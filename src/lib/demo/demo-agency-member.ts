import type { PrismaClient } from "@prisma/client";

/** Canonical demo bench email for agency + org access (idempotent upserts). */
export const DEMO_AGENCY_MEMBER_EMAIL = "member@board.demo" as const;

export const DEMO_AGENCY_MEMBER_FULL_NAME = "Agency Demo Member" as const;

/**
 * Ensures the default demo agency user exists with profile + flags. Safe to call from seeds and migrations.
 */
export async function ensureDemoAgencyMemberUser(prisma: PrismaClient) {
  const user = await prisma.user.upsert({
    where: { email: DEMO_AGENCY_MEMBER_EMAIL },
    create: {
      email: DEMO_AGENCY_MEMBER_EMAIL,
      name: DEMO_AGENCY_MEMBER_FULL_NAME,
      role: "BOARD_MEMBER",
      isDemoUser: true,
      allowDemoOrganizationAssignment: true,
    },
    update: {
      name: DEMO_AGENCY_MEMBER_FULL_NAME,
      isDemoUser: true,
      allowDemoOrganizationAssignment: true,
    },
  });

  await prisma.userProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      fullName: DEMO_AGENCY_MEMBER_FULL_NAME,
      jobTitle: "Agency demo staff",
    },
    update: {
      fullName: DEMO_AGENCY_MEMBER_FULL_NAME,
      jobTitle: "Agency demo staff",
    },
  });

  return user;
}

/**
 * If `agency.isDemoAgency`, adds demo user as `AGENCY_STAFF` (unless they are the owner) and
 * adds `BOARD_MEMBER` on every `isDemoTenant` org under that agency. No-op for non-demo agencies.
 */
export async function syncDemoAgencyMemberForDemoAgency(prisma: PrismaClient, agencyId: string) {
  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
    select: { id: true, isDemoAgency: true, ownerUserId: true },
  });
  if (!agency?.isDemoAgency) {
    return { applied: false as const, reason: "not_demo_agency" as const };
  }

  const demoUser = await ensureDemoAgencyMemberUser(prisma);

  if (demoUser.id !== agency.ownerUserId) {
    await prisma.agencyMember.upsert({
      where: { agencyId_userId: { agencyId, userId: demoUser.id } },
      create: {
        agencyId,
        userId: demoUser.id,
        role: "AGENCY_STAFF",
        status: "ACTIVE",
      },
      update: { role: "AGENCY_STAFF", status: "ACTIVE" },
    });
  }

  const demoOrgs = await prisma.organization.findMany({
    where: { agencyId, isDemoTenant: true },
    select: { id: true },
  });

  for (const o of demoOrgs) {
    await prisma.organizationMembership.upsert({
      where: { organizationId_userId: { organizationId: o.id, userId: demoUser.id } },
      create: {
        organizationId: o.id,
        userId: demoUser.id,
        role: "BOARD_MEMBER",
        title: "Demo participant",
        status: "ACTIVE",
      },
      update: {
        status: "ACTIVE",
      },
    });
  }

  return { applied: true as const, userId: demoUser.id, orgCount: demoOrgs.length };
}

/** Backfills `User.isDemoUser` when the row was created by Supabase before seed ran. */
export async function ensureDemoUserFlagOnUser(prisma: PrismaClient, userId: string, email: string) {
  if (email.toLowerCase() !== DEMO_AGENCY_MEMBER_EMAIL) return;
  await prisma.user.updateMany({
    where: { id: userId, isDemoUser: false },
    data: { isDemoUser: true, allowDemoOrganizationAssignment: true },
  });
}
