import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { assertOrgAccess } from "@/lib/organizations/orgAccess";
import { coerceOrgMembershipRole } from "@/lib/organizations/membershipRole";
import { canPerformNpAssessmentAction } from "@/lib/np-assessment/np-assessment-permissions";
import { ensureParticipant, responsesRecordForParticipant } from "@/lib/np-assessment/assessment-runtime";
import { loadNpAssessmentCatalogFromDb } from "@/lib/np-assessment/load-catalog";
import { NP_ANSWER_LABEL } from "@/lib/np-assessment/answers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ organizationId: string; assessmentId: string }> };

function csvEscape(s: string) {
  if (s.includes('"') || s.includes(",") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(_req: Request, ctx: Ctx) {
  const session = await auth();
  const { organizationId, assessmentId } = await ctx.params;
  const access = await assertOrgAccess(session, organizationId);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }
  const role = coerceOrgMembershipRole(session?.user?.membershipRole ?? "VIEWER");
  if (!canPerformNpAssessmentAction(role, Boolean(session?.user?.isPlatformAdmin), "export")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const assessment = await prisma.npAssessment.findFirst({
    where: { id: assessmentId, organizationId },
  });
  if (!assessment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const categories = await loadNpAssessmentCatalogFromDb();
  const participant = await ensureParticipant(assessmentId, session!.user!.id);
  const responses = await responsesRecordForParticipant(participant.id, categories);

  const noteRows = await prisma.npAssessmentResponse.findMany({
    where: { participantId: participant.id },
    include: { question: { select: { indicatorCode: true } } },
  });
  const notesByCode = new Map(noteRows.map((r) => [r.question.indicatorCode, r.notes ?? ""]));

  const lines: string[] = [
    ["category", "indicator_code", "question", "rating_type", "response", "flagged_for_consult", "notes"].join(","),
  ];

  for (const cat of categories) {
    for (const q of cat.questions) {
      const ans = responses[q.code];
      const label = ans ? NP_ANSWER_LABEL[ans] : "";
      const flagged = ans && ans !== "MET" ? "yes" : "no";
      lines.push(
        [
          csvEscape(cat.name),
          csvEscape(q.code),
          csvEscape(q.text),
          csvEscape(q.rating),
          csvEscape(label),
          flagged,
          csvEscape(notesByCode.get(q.code) ?? ""),
        ].join(","),
      );
    }
  }

  const csv = lines.join("\n");
  const filename = `assessment-${assessmentId.slice(0, 8)}.csv`;
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
