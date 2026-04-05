import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { assertPlatformAdmin } from "@/lib/organizations/platformAdmin";
import { syncDemoAgencyMemberForDemoAgency } from "@/lib/demo/demo-agency-member";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Create a reseller / firm agency. Owner defaults to the platform operator unless `ownerUserId` is supplied.
 */
export async function POST(req: Request) {
  const session = await auth();
  const gate = assertPlatformAdmin(session);
  if (!gate.ok) return gate.response;
  const operatorId = session!.user!.id;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const name =
    typeof body === "object" && body && "name" in body ? String((body as { name: unknown }).name).trim() : "";
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const ownerUserId =
    typeof body === "object" &&
    body &&
    "ownerUserId" in body &&
    typeof (body as { ownerUserId: unknown }).ownerUserId === "string" &&
    (body as { ownerUserId: string }).ownerUserId.trim()
      ? (body as { ownerUserId: string }).ownerUserId.trim()
      : operatorId;

  const owner = await prisma.user.findUnique({ where: { id: ownerUserId }, select: { id: true } });
  if (!owner) {
    return NextResponse.json({ error: "ownerUserId not found" }, { status: 400 });
  }

  const isWhiteLabel =
    typeof body === "object" && body && "isWhiteLabel" in body
      ? Boolean((body as { isWhiteLabel: unknown }).isWhiteLabel)
      : false;

  const isDemoAgency =
    typeof body === "object" && body && "isDemoAgency" in body
      ? Boolean((body as { isDemoAgency: unknown }).isDemoAgency)
      : false;

  const agency = await prisma.agency.create({
    data: {
      name,
      ownerUserId,
      isWhiteLabel,
      isDemoAgency,
    },
  });

  if (isDemoAgency) {
    await syncDemoAgencyMemberForDemoAgency(prisma, agency.id);
  }

  if (ownerUserId !== operatorId) {
    await prisma.agencyMember.upsert({
      where: { agencyId_userId: { agencyId: agency.id, userId: operatorId } },
      create: { agencyId: agency.id, userId: operatorId, role: "AGENCY_ADMIN", status: "ACTIVE" },
      update: { role: "AGENCY_ADMIN", status: "ACTIVE" },
    });
  }

  return NextResponse.json({ id: agency.id, name: agency.name, isDemoAgency: agency.isDemoAgency });
}
