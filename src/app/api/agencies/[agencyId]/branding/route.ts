import { NextResponse } from "next/server";
import { getAgencyDashboardAccess } from "@/lib/agency-dashboard/access";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, ctx: { params: Promise<{ agencyId: string }> }) {
  const { agencyId } = await ctx.params;
  const access = await getAgencyDashboardAccess(agencyId);
  if (!access?.canManageAgency) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!access.agency.isWhiteLabel) {
    return NextResponse.json({ error: "White-label is not enabled for this agency" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const o = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const data: {
    brandingDisplayName?: string | null;
    brandingLogoUrl?: string | null;
    brandingPrimaryColor?: string | null;
    brandingSupportEmail?: string | null;
    brandingFooterText?: string | null;
  } = {};
  if (typeof o.brandingDisplayName === "string") data.brandingDisplayName = o.brandingDisplayName.trim() || null;
  if (typeof o.brandingLogoUrl === "string") data.brandingLogoUrl = o.brandingLogoUrl.trim() || null;
  if (typeof o.brandingPrimaryColor === "string") data.brandingPrimaryColor = o.brandingPrimaryColor.trim() || null;
  if (typeof o.brandingSupportEmail === "string") data.brandingSupportEmail = o.brandingSupportEmail.trim() || null;
  if (typeof o.brandingFooterText === "string") data.brandingFooterText = o.brandingFooterText.trim() || null;

  if (Object.keys(data).length === 0) {
    const a = await prisma.agency.findUnique({ where: { id: agencyId } });
    return NextResponse.json({ ok: true, agency: a });
  }

  const updated = await prisma.agency.update({
    where: { id: agencyId },
    data,
  });

  return NextResponse.json({ ok: true, agency: updated });
}
