import { NextResponse } from "next/server";
import { getAgencyDashboardAccess } from "@/lib/agency-dashboard/access";
import { type AgencyMemberRole, type AgencyMemberStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ agencyId: string; userId: string }> };

/** Update agency member role or active status (not the billing owner row). */
export async function PATCH(req: Request, ctx: Ctx) {
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
  if (userId === agency.ownerUserId) {
    return NextResponse.json({ error: "Cannot change owner via agency member API" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const roleRaw =
    typeof body === "object" && body && "role" in body ? String((body as { role: unknown }).role).toUpperCase() : "";
  const statusRaw =
    typeof body === "object" && body && "status" in body
      ? String((body as { status: unknown }).status).toUpperCase()
      : "";

  const data: { role?: AgencyMemberRole; status?: AgencyMemberStatus } = {};
  if (roleRaw === "AGENCY_ADMIN" || roleRaw === "AGENCY_STAFF") {
    data.role = roleRaw as AgencyMemberRole;
  }
  if (statusRaw === "ACTIVE" || statusRaw === "INACTIVE") {
    data.status = statusRaw as AgencyMemberStatus;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Provide role and/or status" }, { status: 400 });
  }

  const member = await prisma.agencyMember.findUnique({
    where: { agencyId_userId: { agencyId, userId } },
  });
  if (!member) {
    return NextResponse.json({ error: "Agency member not found" }, { status: 404 });
  }

  await prisma.agencyMember.update({
    where: { agencyId_userId: { agencyId, userId } },
    data,
  });

  return NextResponse.json({ ok: true });
}
