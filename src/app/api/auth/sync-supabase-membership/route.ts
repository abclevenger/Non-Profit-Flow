import { NextResponse } from "next/server";
import { getAppAuth } from "@/lib/auth/get-app-auth";
import { prisma } from "@/lib/prisma";
import { createServiceRoleSupabaseClient, isServiceRoleConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Mirrors Prisma `OrganizationMembership` rows into Supabase `organization_members` for the signed-in user.
 * Enables `auth.uid()` RLS on tenant tables. Call once after login (idempotent).
 */
export async function POST() {
  const session = await getAppAuth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { organizationMemberships: { include: { organization: true } } },
  });

  if (!user?.supabaseAuthId) {
    return NextResponse.json(
      { error: "User is not linked to Supabase Auth (supabaseAuthId missing)." },
      { status: 400 },
    );
  }

  if (!isServiceRoleConfigured()) {
    return NextResponse.json({ error: "Supabase service role not configured." }, { status: 503 });
  }

  const sb = createServiceRoleSupabaseClient();
  const uid = user.supabaseAuthId;

  for (const m of user.organizationMemberships) {
    const org = m.organization;
    const { error: tErr } = await sb.from("tenant_organizations").upsert(
      {
        id: org.id,
        is_demo: org.isDemoTenant,
        demo_editing_enabled: org.demoEditingEnabled,
        demo_seed_version: 1,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    if (tErr) {
      return NextResponse.json({ error: `tenant_organizations: ${tErr.message}` }, { status: 500 });
    }

    await sb.from("organization_members").delete().eq("organization_id", org.id).eq("user_id", uid);
    const { error: mErr } = await sb.from("organization_members").insert({
      organization_id: org.id,
      user_id: uid,
      role: m.role,
      updated_at: new Date().toISOString(),
    });
    if (mErr) {
      return NextResponse.json({ error: `organization_members: ${mErr.message}` }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, synced: user.organizationMemberships.length });
}
