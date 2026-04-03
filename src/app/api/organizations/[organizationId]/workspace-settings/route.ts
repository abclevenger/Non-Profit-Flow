import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { assertOrgAccess } from "@/lib/organizations/orgAccess";
import {
  defaultExtendedSettings,
  mergeExtendedSettings,
  parseExtendedSettings,
  type OrganizationExtendedSettings,
} from "@/lib/organization-settings/extended-settings";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ organizationId: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const session = await auth();
  const { organizationId } = await ctx.params;
  const access = await assertOrgAccess(session, organizationId);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }
  if (!session?.user?.canManageOrganizationSettings) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const row = await prisma.organizationSettings.findUnique({
    where: { organizationId },
    select: { extendedSettings: true },
  });
  let raw: unknown = null;
  if (row?.extendedSettings) {
    try {
      raw = JSON.parse(row.extendedSettings) as unknown;
    } catch {
      raw = null;
    }
  }
  const extended = parseExtendedSettings(raw);
  const merged =
    Object.keys(extended).length === 0 ? mergeExtendedSettings(defaultExtendedSettings(), {}) : extended;

  return NextResponse.json({ extended: merged });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const session = await auth();
  const { organizationId } = await ctx.params;
  const access = await assertOrgAccess(session, organizationId);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }
  if (!session?.user?.canManageOrganizationSettings) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const patch = (body as { extended?: Partial<OrganizationExtendedSettings> }).extended;
  if (!patch || typeof patch !== "object") {
    return NextResponse.json({ error: "Expected { extended: { ... } }" }, { status: 400 });
  }

  const row = await prisma.organizationSettings.findUnique({
    where: { organizationId },
    select: { extendedSettings: true },
  });
  let parsed: unknown = null;
  if (row?.extendedSettings) {
    try {
      parsed = JSON.parse(row.extendedSettings) as unknown;
    } catch {
      parsed = null;
    }
  }
  const current = parseExtendedSettings(parsed);
  const base = Object.keys(current).length === 0 ? defaultExtendedSettings() : current;
  const next = mergeExtendedSettings(base, patch);
  const encoded = JSON.stringify(next);

  await prisma.organizationSettings.upsert({
    where: { organizationId },
    create: {
      organizationId,
      themeMode: "light",
      defaultLandingPage: "/overview",
      extendedSettings: encoded,
    },
    update: { extendedSettings: encoded },
  });

  return NextResponse.json({ extended: next });
}
