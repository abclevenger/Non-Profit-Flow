import "server-only";

import { prisma } from "@/lib/prisma";
import { loadNpAssessmentCatalogFromDb } from "./load-catalog";
import { buildExecutiveReportModel, computeStandardsPillarCards } from "./standards-dashboard-model";
import { recomputeReportBundleFromDatabase } from "./assessment-runtime";
import type { NpAssessmentReportModel } from "./scoring";
import type { AiSummaryPayload } from "./scoring";
import type { NpAnswerValue } from "./answers";

export type CompletedReportBundle = {
  kind: "live";
  assessmentId: string;
  report: NpAssessmentReportModel;
  aiPayload: AiSummaryPayload;
  responses: Record<string, NpAnswerValue>;
  executive: ReturnType<typeof buildExecutiveReportModel>;
  /** Live orgs always recompute from DB; demo may use same path for consistency. */
  dataSource: "database_responses";
};

export async function loadCompletedReportBundle(
  organizationId: string,
  assessmentId: string | undefined,
): Promise<
  | { kind: "none"; categories: Awaited<ReturnType<typeof loadNpAssessmentCatalogFromDb>> }
  | CompletedReportBundle
> {
  const categories = await loadNpAssessmentCatalogFromDb();
  let targetId = assessmentId;
  if (!targetId) {
    const latest = await prisma.npAssessment.findFirst({
      where: {
        organizationId,
        OR: [{ status: "COMPLETED" }, { status: "SUBMITTED" }],
      },
      orderBy: [{ submittedAt: "desc" }, { updatedAt: "desc" }],
    });
    targetId = latest?.id;
  }
  if (!targetId) {
    return { kind: "none", categories };
  }

  const assessment = await prisma.npAssessment.findFirst({
    where: { id: targetId, organizationId },
  });
  if (!assessment || (assessment.status !== "COMPLETED" && assessment.status !== "SUBMITTED")) {
    return { kind: "none", categories };
  }

  const recomputed = await recomputeReportBundleFromDatabase(targetId);
  if (!recomputed) {
    return { kind: "none", categories };
  }

  const pillarCards = computeStandardsPillarCards(categories, recomputed.responses);
  const executive = buildExecutiveReportModel(recomputed.report, pillarCards);

  return {
    kind: "live",
    assessmentId: targetId,
    report: recomputed.report,
    aiPayload: recomputed.aiPayload,
    responses: recomputed.responses,
    executive,
    dataSource: "database_responses",
  };
}
