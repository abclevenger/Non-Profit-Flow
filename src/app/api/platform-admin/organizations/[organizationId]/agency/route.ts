import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { assertPlatformAdmin } from "@/lib/organizations/platformAdmin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ organizationId: string }> };

/** Move a nonprofit account between agencies (platform operator only). */
export async function PATCH(req: Request, ctx: Ctx) {
  const session = await auth();
  const gate = assertPlatformAdmin(session);
  if (!gate.ok) return gate.response;

  const { organizationId } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const agencyId =
    typeof body === "object" && body && "agencyId" in body
      ? String((body as { agencyId: unknown }).agencyId).trim()
      : "";
  if (!agencyId) {
    return NextResponse.json({ error: "agencyId is required" }, { status: 400 });
  }

  const [org, agency] = await Promise.all([
    prisma.organization.findUnique({ where: { id: organizationId }, select: { id: true } }),
    prisma.agency.findUnique({ where: { id: agencyId }, select: { id: true } }),
  ]);
  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }
  if (!agency) {
    return NextResponse.json({ error: "Agency not found" }, { status: 404 });
  }

  await prisma.organization.update({
    where: { id: organizationId },
    data: { agencyId },
  });

  return NextResponse.json({ ok: true, organizationId, agencyId });
}
