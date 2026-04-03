import { syntheticOrgRoleForAgencySeat } from "@/lib/agencies/agencyRole";
import { resolveAgencySeat } from "@/lib/agencies/agencyAccess";
import type { Session } from "@/lib/auth/app-session";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getSessionUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

/** Returns membership if user has an **active** row in the org; otherwise null. */
export async function requireOrgMembership(userId: string, organizationId: string) {
  return prisma.organizationMembership.findFirst({
    where: { userId, organizationId, status: "ACTIVE" },
    include: { organization: true },
  });
}

export type OrgMembershipWithOrg = NonNullable<Awaited<ReturnType<typeof requireOrgMembership>>>;

export async function assertOrgAccess(session: Session | null, organizationId: string) {
  if (!session?.user?.id) {
    return { ok: false as const, status: 401 as const, error: "Unauthorized" };
  }
  const m = await requireOrgMembership(session.user.id, organizationId);
  if (m) {
    return { ok: true as const, membership: m };
  }
  if (session.user.isPlatformAdmin) {
    const org = await prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org) {
      return { ok: false as const, status: 403 as const, error: "Forbidden" };
    }
    const synthetic: OrgMembershipWithOrg = {
      id: `platform-access:${organizationId}:${session.user.id}`,
      organizationId,
      userId: session.user.id,
      role: "PLATFORM_ADMIN",
      title: null,
      status: "ACTIVE",
      createdAt: new Date(0),
      updatedAt: new Date(0),
      organization: org,
    };
    return { ok: true as const, membership: synthetic };
  }

  const orgForAgency = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { agencyId: true },
  });
  if (orgForAgency) {
    const seat = await resolveAgencySeat(session.user.id, orgForAgency.agencyId);
    if (seat) {
      const org = await prisma.organization.findUnique({ where: { id: organizationId } });
      if (!org) {
        return { ok: false as const, status: 403 as const, error: "Forbidden" };
      }
      const role = syntheticOrgRoleForAgencySeat(seat);
      const synthetic: OrgMembershipWithOrg = {
        id: `agency-access:${organizationId}:${session.user.id}`,
        organizationId,
        userId: session.user.id,
        role,
        title: null,
        status: "ACTIVE",
        createdAt: new Date(0),
        updatedAt: new Date(0),
        organization: org,
      };
      return { ok: true as const, membership: synthetic };
    }
  }

  return { ok: false as const, status: 403 as const, error: "Forbidden" };
}
