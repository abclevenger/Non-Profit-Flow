import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { assertOrgAccess } from "@/lib/organizations/orgAccess";
import { prisma } from "@/lib/prisma";
import { isServiceRoleConfigured } from "@/lib/supabase/admin";
import { fetchTenantSnapshot } from "@/lib/tenant/fetchTenantSnapshot";
import { mapSnapshotToOrganizationProfile } from "@/lib/tenant/mapSnapshotToProfile";

export const dynamic = "force-dynamic";

type RouteCtx = { params: Promise<{ organizationId: string }> };

/**
 * Full dashboard profile for the active org, sourced from Supabase tenant tables when enabled.
 * Authorization: Prisma org membership (same as other org APIs). Uses service role server-side after check.
 */
export async function GET(_req: Request, ctx: RouteCtx) {
  const session = await auth();
  const { organizationId } = await ctx.params;
  const access = await assertOrgAccess(session, organizationId);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
  });
  if (!org?.useSupabaseTenantData) {
    return NextResponse.json(
      { error: "Organization is not configured for Supabase tenant data." },
      { status: 400 },
    );
  }

  if (!isServiceRoleConfigured()) {
    return NextResponse.json(
      { error: "Server is missing Supabase service role configuration." },
      { status: 503 },
    );
  }

  try {
    const snapshot = await fetchTenantSnapshot(organizationId);
    const profile = mapSnapshotToOrganizationProfile(snapshot, {
      name: org.name,
      missionSnippet: org.missionSnippet,
      logoUrl: org.logoUrl,
      primaryColor: org.primaryColor,
      secondaryColor: org.secondaryColor,
      demoProfileKey: org.demoProfileKey,
    });
    return NextResponse.json({ profile, organizationId });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Snapshot failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
