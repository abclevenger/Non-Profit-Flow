import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { assertOrgAccess } from "@/lib/organizations/orgAccess";
import { coerceOrgMembershipRole } from "@/lib/organizations/membershipRole";
import { canFillNpAssessmentWizard } from "@/lib/np-assessment/np-assessment-permissions";
import { ensureParticipant, saveAssessmentResponses } from "@/lib/np-assessment/assessment-runtime";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ organizationId: string; assessmentId: string }> };

const itemSchema = z.object({
  indicatorCode: z.string().min(1),
  answer: z.enum(["MET", "NEEDS_WORK", "NA", "DONT_KNOW"]),
  notes: z.string().max(4000).nullable().optional(),
});

const bodySchema = z.object({
  items: z.array(itemSchema).min(1),
});

export async function POST(req: Request, ctx: Ctx) {
  const session = await auth();
  const { organizationId, assessmentId } = await ctx.params;
  const access = await assertOrgAccess(session, organizationId);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }
  const role = coerceOrgMembershipRole(session?.user?.membershipRole ?? "VIEWER");
  const isPlatform = Boolean(session?.user?.isPlatformAdmin);

  const assessment = await prisma.npAssessment.findFirst({
    where: { id: assessmentId, organizationId },
  });
  if (!assessment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!canFillNpAssessmentWizard(role, isPlatform, assessment.allowBoardMemberFill)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  try {
    const participant = await ensureParticipant(assessmentId, session!.user!.id);
    await saveAssessmentResponses(assessmentId, participant.id, session!.user!.id, parsed.data.items);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Save failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
