import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  EXPERT_REVIEW_CATEGORY_KEYS,
  EXPERT_REVIEW_CATEGORY_LABEL,
  EXPERT_REVIEW_NO_ROUTE_ERROR,
  EXPERT_PRIORITY_KEYS,
} from "@/lib/expert-review/constants";
import { canSubmitExpertReview, canViewAllExpertReviews } from "@/lib/expert-review/permissions";
import { assertOrgAccess } from "@/lib/organizations/orgAccess";
import { sendIssueRoutingEmail } from "@/lib/email/sendIssueRoutingEmail";
import { prisma } from "@/lib/prisma";
import { toExpertReviewPublicJson } from "@/lib/expert-review/serialize";

function str(v: unknown, max: number): string | null {
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
  if (!canSubmitExpertReview(session.user.role)) {
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

  const category = searchParams.get("category") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const priority = searchParams.get("priority") ?? undefined;

  const where: Prisma.ExpertReviewRequestWhereInput = { organizationId };
  if (category) where.category = category;
  if (status) where.status = status;
  if (priority) where.priority = priority;

  const viewAll = canViewAllExpertReviews(session);
  if (!viewAll) {
    where.createdByUserId = session.user.id;
  }

  const rows = await prisma.expertReviewRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const items = rows.map(toExpertReviewPublicJson);
  const open = items.filter((i) => i.status !== "COMPLETED");
  const urgentOpen = open.filter((i) => i.priority === "URGENT").length;
  const lastSubmitted = items[0] ?? null;

  return NextResponse.json({
    items,
    summary: {
      openCount: open.length,
      urgentOpenCount: urgentOpen,
      lastSubmitted,
    },
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canSubmitExpertReview(session.user.role)) {
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
  const categoryRaw = typeof o.category === "string" ? o.category.trim() : "";
  const subject = str(o.subject, 500);
  const summary = str(o.summary, 8000);
  const priorityRaw = typeof o.priority === "string" ? o.priority.trim() : "";
  const additionalNotes = str(o.additionalNotes, 8000);
  const relatedItemType = typeof o.relatedItemType === "string" ? o.relatedItemType.trim().slice(0, 64) : "";
  const relatedItemId = typeof o.relatedItemId === "string" ? o.relatedItemId.trim().slice(0, 500) : "";
  const relatedItemTitle = typeof o.relatedItemTitle === "string" ? o.relatedItemTitle.trim().slice(0, 500) : null;
  const relatedHref = typeof o.relatedHref === "string" ? o.relatedHref.trim().slice(0, 2000) : null;
  const organizationName =
    typeof o.organizationName === "string" ? o.organizationName.trim().slice(0, 300) : null;

  let deadline: Date | null = null;
  if (typeof o.deadline === "string" && o.deadline.trim()) {
    const d = new Date(o.deadline);
    if (!Number.isNaN(d.getTime())) deadline = d;
  }

  if (
    !organizationId ||
    !(EXPERT_REVIEW_CATEGORY_KEYS as readonly string[]).includes(categoryRaw) ||
    !subject ||
    !summary ||
    !(EXPERT_PRIORITY_KEYS as readonly string[]).includes(priorityRaw) ||
    !relatedItemType ||
    !relatedItemId
  ) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }

  const access = await assertOrgAccess(session, organizationId);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const rule = await prisma.issueRoutingRule.findFirst({
    where: { organizationId, category: categoryRaw },
  });
  if (!rule || !rule.isActive) {
    return NextResponse.json({ error: EXPERT_REVIEW_NO_ROUTE_ERROR }, { status: 400 });
  }

  const dest =
    rule.destinationEmail?.trim() ||
    rule.fallbackEmail?.trim() ||
    "";
  if (!dest) {
    return NextResponse.json({ error: EXPERT_REVIEW_NO_ROUTE_ERROR }, { status: 400 });
  }

  const categoryLabel = EXPERT_REVIEW_CATEGORY_LABEL[categoryRaw as keyof typeof EXPERT_REVIEW_CATEGORY_LABEL];

  const created = await prisma.expertReviewRequest.create({
    data: {
      organizationId,
      category: categoryRaw,
      subject,
      summary,
      priority: priorityRaw,
      deadline,
      additionalNotes,
      createdByUserId: session.user.id,
      createdByEmail: session.user.email ?? null,
      createdByName: session.user.name?.trim() || null,
      relatedItemType,
      relatedItemId,
      relatedItemTitle,
      relatedHref,
      organizationName,
      destinationEmail: dest,
      status: "ROUTED",
    },
  });

  const textBody = `${summary}\n\n— ${session.user.name ?? session.user.email ?? "Board member"}`;
  const emailResult = await sendIssueRoutingEmail({
    to: dest,
    subject: `[${categoryLabel}] ${subject}`,
    textBody,
    htmlBody: `<p>${summary.replace(/\n/g, "<br/>")}</p>`,
  });

  const updated = await prisma.expertReviewRequest.update({
    where: { id: created.id },
    data: {
      status: emailResult.ok ? "EMAIL_SENT" : "ROUTED",
      emailSentAt: emailResult.ok ? new Date() : null,
      lastError: emailResult.error ?? null,
    },
  });

  return NextResponse.json({
    ok: true,
    item: toExpertReviewPublicJson(updated),
    emailSent: emailResult.ok,
    message: emailResult.ok ? "Request routed and email sent." : "Request saved; email delivery pending.",
    warning: emailResult.error ?? undefined,
    routedToEmail: dest,
  });
}
