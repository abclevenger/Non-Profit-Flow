import { NextResponse } from "next/server";
import { getAgencyDashboardAccess } from "@/lib/agency-dashboard/access";
import { defaultExtendedSettings } from "@/lib/organization-settings/extended-settings";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return base || "nonprofit";
}

export async function POST(req: Request, ctx: { params: Promise<{ agencyId: string }> }) {
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
  const name =
    typeof body === "object" && body && "name" in body ? String((body as { name: unknown }).name).trim() : "";
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  let slug =
    typeof body === "object" && body && "slug" in body
      ? String((body as { slug: unknown }).slug).trim().toLowerCase()
      : "";
  if (!slug) slug = slugify(name);

  const exists = await prisma.organization.findUnique({ where: { slug } });
  if (exists) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const org = await prisma.organization.create({
    data: {
      agencyId,
      name,
      slug,
      missionSnippet:
        typeof body === "object" && body && "missionSnippet" in body
          ? String((body as { missionSnippet: unknown }).missionSnippet).trim() || null
          : null,
      isDemoTenant: false,
      demoModeEnabled: false,
      demoEditingEnabled: false,
      onboardingStatus: "ACTIVE",
      billingPlan: "STARTER",
    },
  });

  const ext = JSON.stringify(defaultExtendedSettings());
  await prisma.organizationSettings.create({
    data: {
      organizationId: org.id,
      themeMode: "light",
      defaultLandingPage: "/overview",
      extendedSettings: ext,
    },
  });

  const modules = [
    "STRATEGY",
    "GOVERNANCE",
    "RISKS",
    "MEETINGS",
    "MINUTES",
    "VOTING",
    "TRAINING",
    "DOCUMENTS",
  ] as const;
  for (const moduleName of modules) {
    await prisma.organizationModule.create({
      data: { organizationId: org.id, moduleName, isEnabled: true },
    });
  }

  return NextResponse.json({ id: org.id, slug: org.slug });
}
