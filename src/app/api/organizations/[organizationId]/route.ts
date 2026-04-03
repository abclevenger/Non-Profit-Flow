import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getDashboardProfile } from "@/lib/mock-data/dashboardData";
import type { SampleProfileId } from "@/lib/mock-data/types";
import { assertOrgAccess } from "@/lib/organizations/orgAccess";
import { normalizeHex } from "@/lib/organization-settings/colors";
import { mergeModulesState } from "@/lib/organization-settings/modules";
import { canManageOrganizationSettings } from "@/lib/organization-settings/permissions";
import { prisma } from "@/lib/prisma";

const modulesSchema = z.object({
  STRATEGY: z.boolean(),
  GOVERNANCE: z.boolean(),
  RISKS: z.boolean(),
  MEETINGS: z.boolean(),
  MINUTES: z.boolean(),
  VOTING: z.boolean(),
  TRAINING: z.boolean(),
  DOCUMENTS: z.boolean(),
});

const patchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  missionSnippet: z.union([z.string().max(2000), z.null()]).optional(),
  logoUrl: z.union([z.string().max(600_000), z.null()]).optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  modules: modulesSchema.optional(),
  resetBranding: z.boolean().optional(),
});

const ORG_NAME_BY_SLUG: Record<string, string> = {
  "community-outreach": "Community Outreach Network",
  "growing-impact": "Growing Impact Alliance",
  "riverside-academy": "Riverside Academy Foundation",
};

function coerceProfileKey(k: string | null): SampleProfileId {
  if (k === "growingNonprofit" || k === "privateSchool" || k === "communityNonprofit") return k;
  return "communityNonprofit";
}

type RouteCtx = { params: Promise<{ organizationId: string }> };

async function syncModules(organizationId: string, modules: ReturnType<typeof mergeModulesState>) {
  for (const [moduleName, isEnabled] of Object.entries(modules)) {
    await prisma.organizationModule.upsert({
      where: {
        organizationId_moduleName: { organizationId, moduleName },
      },
      create: { organizationId, moduleName, isEnabled },
      update: { isEnabled },
    });
  }
}

export async function PATCH(req: Request, ctx: RouteCtx) {
  const session = await auth();
  if (!session?.user?.id || !canManageOrganizationSettings(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { organizationId } = await ctx.params;
  const access = await assertOrgAccess(session, organizationId);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }

  const body = parsed.data;
  const org = await prisma.organization.findUnique({ where: { id: organizationId } });
  if (!org) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.resetBranding) {
    const pk = coerceProfileKey(org.demoProfileKey);
    const defaults = getDashboardProfile(pk);
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        name: ORG_NAME_BY_SLUG[org.slug] ?? org.name,
        missionSnippet: defaults.missionSnippet,
        logoUrl: null,
        primaryColor: defaults.theme.accent,
        secondaryColor: "#5c7a7a",
        accentColor: defaults.theme.accent,
      },
    });
    await syncModules(organizationId, mergeModulesState(null));
    return NextResponse.json({ ok: true, message: "Branding reset to defaults" });
  }

  const primary = body.primaryColor !== undefined ? normalizeHex(body.primaryColor) : undefined;
  const secondary = body.secondaryColor !== undefined ? normalizeHex(body.secondaryColor) : undefined;
  const accent = body.accentColor !== undefined ? normalizeHex(body.accentColor) : undefined;
  if (body.primaryColor !== undefined && !primary) {
    return NextResponse.json({ error: "Invalid primaryColor" }, { status: 400 });
  }
  if (body.secondaryColor !== undefined && !secondary) {
    return NextResponse.json({ error: "Invalid secondaryColor" }, { status: 400 });
  }
  if (body.accentColor !== undefined && body.accentColor !== "" && !accent) {
    return NextResponse.json({ error: "Invalid accentColor" }, { status: 400 });
  }

  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      ...(body.name !== undefined ? { name: body.name.trim() } : {}),
      ...(body.missionSnippet !== undefined ? { missionSnippet: body.missionSnippet } : {}),
      ...(body.logoUrl !== undefined ? { logoUrl: body.logoUrl === null ? null : body.logoUrl.trim() || null } : {}),
      ...(primary !== undefined ? { primaryColor: primary } : {}),
      ...(secondary !== undefined ? { secondaryColor: secondary } : {}),
      ...(body.accentColor !== undefined ? { accentColor: accent ?? null } : {}),
    },
  });

  if (body.modules) {
    await syncModules(organizationId, mergeModulesState(body.modules));
  }

  return NextResponse.json({ ok: true, message: "Branding updated successfully" });
}
