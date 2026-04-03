import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { assertOrgAccess } from "@/lib/organizations/orgAccess";
import { canAccessGcReviewQueue, canFlagForGcReview } from "@/lib/gc-review/permissions";
import { isGcItemType, isGcUrgencyKey, toFullJson, toPublicJson } from "@/lib/gc-review/serialize";
import { prisma } from "@/lib/prisma";

function str(v: unknown, max = 8000): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  return t.slice(0, max);
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canFlagForGcReview(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const organizationId = searchParams.get("organizationId")?.trim();
  if (!organizationId) {
    return NextResponse.json({ error: "organizationId required" }, { status: 400 });
  }

  const access = await assertOrgAccess(session, organizationId);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const expand = searchParams.get("expand") === "gc";
  const rows = await prisma.gcReviewRequest.findMany({
    where: { organizationId },
    orderBy: { flaggedAt: "desc" },
  });

  if (expand) {
    if (!canAccessGcReviewQueue(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({
      items: rows.map(toFullJson),
      summary: computeSummaryFromRows(rows),
    });
  }

  return NextResponse.json({
    items: rows.map(toPublicJson),
    summary: computeSummaryFromRows(rows),
  });
}

function computeSummaryFromRows(rows: { status: string; urgency: string; relatedDeadline: Date | null }[]) {
  const open = rows.filter((r) => r.status !== "COMPLETE");
  const highRiskOpen = open.filter((r) => r.urgency === "HIGH_RISK").length;
  const deadlines = open
    .filter((r) => r.urgency === "HIGH_RISK" || r.urgency === "TIME_SENSITIVE")
    .map((r) => r.relatedDeadline)
    .filter(Boolean) as Date[];
  deadlines.sort((a, b) => a.getTime() - b.getTime());
  return {
    pendingCount: open.length,
    highRiskOpenCount: highRiskOpen,
    nextUrgentDeadline: deadlines[0] ? deadlines[0].toISOString() : null,
  };
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canFlagForGcReview(session.user.role)) {
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
  const itemType = typeof o.itemType === "string" ? o.itemType : "";
  const itemId = typeof o.itemId === "string" ? o.itemId.trim().slice(0, 500) : "";
  const itemTitle = typeof o.itemTitle === "string" ? o.itemTitle.trim().slice(0, 500) : "";
  const reason = str(o.reason, 4000);
  const summaryConcern = str(o.summaryConcern, 4000);
  const supportingNotes = str(o.supportingNotes, 8000) ?? null;
  const urgencyRaw = typeof o.urgency === "string" ? o.urgency.trim() : "";
  const urgency = isGcUrgencyKey(urgencyRaw) ? urgencyRaw : null;

  let relatedDeadline: Date | null = null;
  if (typeof o.relatedDeadline === "string" && o.relatedDeadline.trim()) {
    const d = new Date(o.relatedDeadline);
    if (!Number.isNaN(d.getTime())) relatedDeadline = d;
  }

  if (!organizationId || !isGcItemType(itemType) || !itemId || !itemTitle || !reason || !summaryConcern || !urgency) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }

  const access = await assertOrgAccess(session, organizationId);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const name = session.user.name?.trim() || null;
  const email = session.user.email?.trim() || null;

  const existing = await prisma.gcReviewRequest.findUnique({
    where: { organizationId_itemType_itemId: { organizationId, itemType, itemId } },
  });

  if (existing) {
    if (existing.status !== "COMPLETE") {
      return NextResponse.json(
        { error: "This item is already flagged for review.", id: existing.id },
        { status: 409 },
      );
    }
    const updated = await prisma.gcReviewRequest.update({
      where: { id: existing.id },
      data: {
        itemTitle,
        reason,
        summaryConcern,
        urgency,
        relatedDeadline,
        supportingNotes,
        status: "PENDING",
        flaggedByUserId: session.user.id,
        flaggedByEmail: email,
        flaggedByName: name,
        flaggedAt: new Date(),
        reviewNotes: null,
        recommendation: null,
        nextStep: null,
        reviewCompletedAt: null,
        reviewedByUserId: null,
      },
    });
    return NextResponse.json({ ok: true, item: toPublicJson(updated), reopened: true });
  }

  const created = await prisma.gcReviewRequest.create({
    data: {
      organizationId,
      itemType,
      itemId,
      itemTitle,
      reason,
      summaryConcern,
      urgency,
      relatedDeadline,
      supportingNotes,
      status: "PENDING",
      flaggedByUserId: session.user.id,
      flaggedByEmail: email,
      flaggedByName: name,
    },
  });

  return NextResponse.json({ ok: true, item: toPublicJson(created) });
}
