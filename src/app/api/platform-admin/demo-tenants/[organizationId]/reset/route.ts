import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { assertPlatformAdmin } from "@/lib/organizations/platformAdmin";
import { prisma } from "@/lib/prisma";
import { isServiceRoleConfigured } from "@/lib/supabase/admin";
import { seedSupabaseTenantForDemoOrg } from "@/lib/tenant/seedSupabaseTenantData";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ organizationId: string }> };

/**
 * Re-seeds Supabase tenant tables from the org's `demoProfileKey` bundle.
 * Preserves Prisma `demoEditingEnabled` on the mirrored `tenant_organizations` row.
 */
export async function POST(_req: Request, ctx: Ctx) {
  const session = await auth();
  const gate = assertPlatformAdmin(session);
  if (!gate.ok) return gate.response;

  const { organizationId } = await ctx.params;
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      isDemoTenant: true,
      demoProfileKey: true,
      demoEditingEnabled: true,
    },
  });
  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }
  if (!org.isDemoTenant) {
    return NextResponse.json({ error: "Only demo tenants can be reset from this endpoint." }, { status: 400 });
  }
  if (!isServiceRoleConfigured()) {
    return NextResponse.json({ error: "Supabase service role is not configured." }, { status: 503 });
  }

  try {
    await seedSupabaseTenantForDemoOrg(org.id, org.demoProfileKey, true, {
      demoEditingEnabled: org.demoEditingEnabled,
    });
    return NextResponse.json({ ok: true, organizationId: org.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Reset failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
