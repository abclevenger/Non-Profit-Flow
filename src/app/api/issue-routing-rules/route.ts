import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { assertOrgAccess } from "@/lib/organizations/orgAccess";
import { EXPERT_REVIEW_CATEGORY_KEYS, EXPERT_REVIEW_CATEGORY_LABEL } from "@/lib/expert-review/constants";
import { canManageIssueRouting } from "@/lib/expert-review/permissions";
import { prisma } from "@/lib/prisma";
import { toRoutingRuleJson } from "@/lib/expert-review/serialize";

function orgIdFromRequest(req: Request): string | null {
  const { searchParams } = new URL(req.url);
  return searchParams.get("organizationId")?.trim() || null;
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !canManageIssueRouting(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const organizationId = orgIdFromRequest(req);
  if (!organizationId) {
    return NextResponse.json({ error: "organizationId required" }, { status: 400 });
  }

  const access = await assertOrgAccess(session, organizationId);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const rows = await prisma.issueRoutingRule.findMany({
    where: { organizationId },
    orderBy: { category: "asc" },
  });
  return NextResponse.json({ rules: rows.map(toRoutingRuleJson) });
}

type RuleInput = {
  category: string;
  displayName?: string;
  destinationEmail?: string;
  fallbackEmail?: string | null;
  isActive?: boolean;
  notes?: string | null;
};

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !canManageIssueRouting(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const o = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const organizationId = typeof o.organizationId === "string" ? o.organizationId.trim() : "";
  const rules = o.rules;
  if (!organizationId) {
    return NextResponse.json({ error: "organizationId required" }, { status: 400 });
  }
  if (!Array.isArray(rules)) {
    return NextResponse.json({ error: "rules array required" }, { status: 400 });
  }

  const access = await assertOrgAccess(session, organizationId);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  for (const r of rules as RuleInput[]) {
    if (!r || typeof r !== "object") continue;
    const cat = typeof r.category === "string" ? r.category.trim() : "";
    if (!(EXPERT_REVIEW_CATEGORY_KEYS as readonly string[]).includes(cat)) continue;

    const displayName =
      typeof r.displayName === "string" && r.displayName.trim()
        ? r.displayName.trim().slice(0, 200)
        : EXPERT_REVIEW_CATEGORY_LABEL[cat as keyof typeof EXPERT_REVIEW_CATEGORY_LABEL];
    const destinationEmail =
      typeof r.destinationEmail === "string" ? r.destinationEmail.trim().slice(0, 320) : "";
    const fallbackEmail =
      typeof r.fallbackEmail === "string" && r.fallbackEmail.trim()
        ? r.fallbackEmail.trim().slice(0, 320)
        : null;
    const isActive = typeof r.isActive === "boolean" ? r.isActive : true;
    const notes =
      typeof r.notes === "string"
        ? r.notes.trim().slice(0, 2000) || null
        : r.notes === null
          ? null
          : undefined;

    await prisma.issueRoutingRule.upsert({
      where: {
        organizationId_category: { organizationId, category: cat },
      },
      create: {
        organizationId,
        category: cat,
        displayName,
        destinationEmail,
        fallbackEmail,
        isActive,
        notes: notes ?? null,
      },
      update: {
        displayName,
        destinationEmail,
        fallbackEmail,
        isActive,
        ...(notes !== undefined ? { notes } : {}),
      },
    });
  }

  const rows = await prisma.issueRoutingRule.findMany({
    where: { organizationId },
    orderBy: { category: "asc" },
  });
  return NextResponse.json({ ok: true, rules: rows.map(toRoutingRuleJson) });
}
