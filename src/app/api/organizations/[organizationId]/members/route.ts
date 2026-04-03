import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { assertOrgAccess } from "@/lib/organizations/orgAccess";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ organizationId: string }> };

/** Org admins (and platform admins) list members for the active tenant. */
export async function GET(_req: Request, ctx: Ctx) {
  const session = await auth();
  const { organizationId } = await ctx.params;
  const access = await assertOrgAccess(session, organizationId);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }
  const canList =
    Boolean(session?.user?.canManageOrganizationSettings) || Boolean(session?.user?.isPlatformAdmin);
  if (!canList) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = await prisma.organizationMembership.findMany({
    where: { organizationId },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { id: true, email: true, name: true, allowDemoOrganizationAssignment: true } },
    },
  });

  return NextResponse.json({
    members: rows.map((m) => ({
      membershipId: m.id,
      role: m.role,
      createdAt: m.createdAt,
      user: m.user,
    })),
  });
}
