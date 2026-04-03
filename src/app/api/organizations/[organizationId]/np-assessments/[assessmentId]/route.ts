import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { assertOrgAccess } from "@/lib/organizations/orgAccess";
import { coerceOrgMembershipRole } from "@/lib/organizations/membershipRole";
import { canPerformNpAssessmentAction } from "@/lib/np-assessment/np-assessment-permissions";
import { loadAssessmentWorkspaceForUser } from "@/lib/np-assessment/assessment-runtime";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ organizationId: string; assessmentId: string }> };

const patchBody = z.object({
  currentCategoryIndex: z.number().int().min(0).optional(),
  status: z.literal("ARCHIVED").optional(),
});

export async function GET(_req: Request, ctx: Ctx) {
  const session = await auth();
  const { organizationId, assessmentId } = await ctx.params;
  const access = await assertOrgAccess(session, organizationId);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }
  const role = coerceOrgMembershipRole(session?.user?.membershipRole ?? "VIEWER");
  if (!canPerformNpAssessmentAction(role, Boolean(session?.user?.isPlatformAdmin), "fill")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const workspace = await loadAssessmentWorkspaceForUser(assessmentId, session!.user!.id);
  if (!workspace || workspace.assessment.organizationId !== organizationId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const noteRows = await prisma.npAssessmentResponse.findMany({
    where: { participantId: workspace.participantId },
    select: { notes: true, question: { select: { indicatorCode: true } } },
  });
  const notes: Record<string, string> = {};
  for (const r of noteRows) {
    if (r.notes?.trim()) notes[r.question.indicatorCode] = r.notes;
  }

  return NextResponse.json({
    assessment: {
      id: workspace.assessment.id,
      title: workspace.assessment.title,
      status: workspace.assessment.status,
      currentCategoryIndex: workspace.assessment.currentCategoryIndex,
      submittedAt: workspace.assessment.submittedAt,
      organizationId: workspace.assessment.organizationId,
    },
    participantId: workspace.participantId,
    categories: workspace.categories,
    responses: workspace.responses,
    notes,
    answeredCount: workspace.answeredCount,
    totalQuestions: workspace.totalQuestions,
  });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const session = await auth();
  const { organizationId, assessmentId } = await ctx.params;
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
  const parsed = patchBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const existing = await prisma.npAssessment.findFirst({
    where: { id: assessmentId, organizationId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const role = coerceOrgMembershipRole(session?.user?.membershipRole ?? "VIEWER");
  const isPlatform = Boolean(session?.user?.isPlatformAdmin);

  if (parsed.data.status === "ARCHIVED") {
    if (!canPerformNpAssessmentAction(role, isPlatform, "archive")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await prisma.npAssessment.update({
      where: { id: assessmentId },
      data: { status: "ARCHIVED" },
    });
    return NextResponse.json({ ok: true });
  }

  if (typeof parsed.data.currentCategoryIndex === "number") {
    if (!canPerformNpAssessmentAction(role, isPlatform, "fill")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (existing.status === "COMPLETED" || existing.status === "SUBMITTED" || existing.status === "ARCHIVED") {
      return NextResponse.json({ error: "Assessment is closed" }, { status: 400 });
    }
    await prisma.npAssessment.update({
      where: { id: assessmentId },
      data: { currentCategoryIndex: parsed.data.currentCategoryIndex },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "No changes" }, { status: 400 });
}
