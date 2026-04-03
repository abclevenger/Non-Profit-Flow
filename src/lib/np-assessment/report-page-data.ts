import "server-only";

import { prisma } from "@/lib/prisma";
import { getLatestStoredReport } from "./assessment-runtime";
import { loadNpAssessmentCatalogFromDb } from "./load-catalog";
import { buildExecutiveReportModel, computeStandardsPillarCards } from "./standards-dashboard-model";

export async function loadCompletedReportBundle(
  organizationId: string,
  assessmentId: string | undefined,
): Promise<
  | { kind: "none"; categories: Awaited<ReturnType<typeof loadNpAssessmentCatalogFromDb>> }
  | {
      kind: "live";
      assessmentId: string;
      report: NonNullable<Awaited<ReturnType<typeof getLatestStoredReport>>>["report"];
      aiPayload: NonNullable<Awaited<ReturnType<typeof getLatestStoredReport>>>["aiPayload"];
      executive: ReturnType<typeof buildExecutiveReportModel>;
    }
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

  const stored = await getLatestStoredReport(targetId);
  if (!stored) {
    return { kind: "none", categories };
  }

  const pillarCards = computeStandardsPillarCards(categories, stored.responses);
  const executive = buildExecutiveReportModel(stored.report, pillarCards);

  return {
    kind: "live",
    assessmentId: targetId,
    report: stored.report,
    aiPayload: stored.aiPayload,
    executive,
  };
}
