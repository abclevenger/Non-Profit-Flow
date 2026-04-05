import { NextResponse } from "next/server";
import { getAgencyDashboardAccess } from "@/lib/agency-dashboard/access";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ agencyId: string }> };

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

/** Invite / add a user to the agency team (creates `User` if they have not signed in yet). */
export async function POST(req: Request, ctx: Ctx) {
  const { agencyId } = await ctx.params;
  const access = await getAgencyDashboardAccess(agencyId);
  if (!access?.canManageAgency) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const email =
    typeof body === "object" && body && "email" in body ? normalizeEmail(String((body as { email: unknown }).email)) : "";
  const roleRaw =
    typeof body === "object" && body && "role" in body ? String((body as { role: unknown }).role).toUpperCase() : "";
  const role = roleRaw === "AGENCY_ADMIN" ? "AGENCY_ADMIN" : "AGENCY_STAFF";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  const agency = await prisma.agency.findUnique({
    where: { id: agencyId },
    select: { ownerUserId: true },
  });
  if (!agency) {
    return NextResponse.json({ error: "Agency not found" }, { status: 404 });
  }

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: { email, role: "BOARD_MEMBER" },
    });
  }

  if (user.id === agency.ownerUserId) {
    return NextResponse.json({ error: "Owner is already on this agency" }, { status: 400 });
  }

  await prisma.agencyMember.upsert({
    where: { agencyId_userId: { agencyId, userId: user.id } },
    create: { agencyId, userId: user.id, role, status: "ACTIVE" },
    update: { role, status: "ACTIVE" },
  });

  return NextResponse.json({ userId: user.id, email: user.email });
}
