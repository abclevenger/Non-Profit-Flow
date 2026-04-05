import { NextResponse } from "next/server";
import { getAgencyDashboardAccess } from "@/lib/agency-dashboard/access";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ agencyId: string; userId: string }> };

const MANAGED_ROLES = new Set(["STAFF", "VIEWER"]);

/**
 * Sync nonprofit access for an agency team user: adds `STAFF` memberships for selected orgs;
 * removes only `STAFF`/`VIEWER` memberships under this agency when deselected (preserves board/admin seats).
 */
export async function PUT(req: Request, ctx: Ctx) {
  const { agencyId, userId } = await ctx.params;
  const access = await getAgencyDashboardAccess(agencyId);
  if (!access?.canManageAgency) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
    select: { ownerUserId: true },
  });
  if (!agency) {
    return NextResponse.json({ error: "Agency not found" }, { status: 404 });
  }

  if (userId !== agency.ownerUserId) {
    const m = await prisma.agencyMember.findUnique({
      where: { agencyId_userId: { agencyId, userId } },
    });
    if (!m) {
      return NextResponse.json({ error: "User is not on this agency team" }, { status: 404 });
    }
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const organizationIds =
    typeof body === "object" &&
    body &&
    "organizationIds" in body &&
    Array.isArray((body as { organizationIds: unknown }).organizationIds)
      ? (body as { organizationIds: string[] }).organizationIds.filter((x) => typeof x === "string")
      : [];

  const agencyOrgs = await prisma.organization.findMany({
    where: { agencyId },
    select: { id: true },
  });
  const allowedIds = agencyOrgs.map((o) => o.id);
  const allowedSet = new Set(allowedIds);
  const selected = new Set(organizationIds.filter((id) => allowedSet.has(id)));

  const existing = await prisma.organizationMembership.findMany({
    where: { userId, organizationId: { in: allowedIds } },
  });
  const existingByOrg = new Map(existing.map((m) => [m.organizationId, m]));

  for (const oid of allowedIds) {
    const want = selected.has(oid);
    const ex = existingByOrg.get(oid);
    if (!want) {
      if (ex && MANAGED_ROLES.has(ex.role)) {
        await prisma.organizationMembership.delete({ where: { id: ex.id } });
      }
      continue;
    }
    if (!ex) {
      await prisma.organizationMembership.create({
        data: {
          organizationId: oid,
          userId,
          role: "STAFF",
          status: "ACTIVE",
          title: "Agency team",
        },
      });
    } else if (MANAGED_ROLES.has(ex.role)) {
      await prisma.organizationMembership.update({
        where: { id: ex.id },
        data: { status: "ACTIVE", role: "STAFF" },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
