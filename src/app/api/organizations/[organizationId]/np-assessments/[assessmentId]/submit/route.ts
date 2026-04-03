import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { assertOrgAccess } from "@/lib/organizations/orgAccess";
import { coerceOrgMembershipRole } from "@/lib/organizations/membershipRole";
import { canPerformNpAssessmentAction } from "@/lib/np-assessment/np-assessment-permissions";
import { ensureParticipant, submitAssessment } from "@/lib/np-assessment/assessment-runtime";
import { loadNpAssessmentCatalogFromDb } from "@/lib/np-assessment/load-catalog";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ organizationId: string; assessmentId: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  const session = await auth();
  const { organizationId, assessmentId } = await ctx.params;
  const access = await assertOrgAccess(session, organizationId);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }
  const role = coerceOrgMembershipRole(session?.user?.membershipRole ?? "VIEWER");
  if (!canPerformNpAssessmentAction(role, Boolean(session?.user?.isPlatformAdmin), "submit")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const assessment = await prisma.npAssessment.findFirst({
    where: { id: assessmentId, organizationId },
  });
  if (!assessment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const categories = await loadNpAssessmentCatalogFromDb();
    if (categories.length === 0) {
      return NextResponse.json({ error: "Assessment catalog not seeded" }, { status: 503 });
    }
    const participant = await ensureParticipant(assessmentId, session!.user!.id);
    const result = await submitAssessment(assessmentId, participant.id, session!.user!.id, categories);
    return NextResponse.json({ ok: true, report: result.report, aiPayload: result.aiPayload });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Submit failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
