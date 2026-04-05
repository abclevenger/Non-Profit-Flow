import "server-only";

import { prisma } from "@/lib/prisma";
import { demoResponsesForCategories } from "./demo-responses";
import { loadNpAssessmentCatalogFromDb } from "./load-catalog";
import { buildExecutiveReportModel, computeStandardsPillarCards } from "./standards-dashboard-model";
import { recomputeReportBundleFromDatabase } from "./assessment-runtime";
import {
  buildAiSummaryPayload,
  computeNpAssessmentReport,
  questionsMapFromCategories,
  type AiSummaryPayload,
  type NpAssessmentReportModel,
} from "./scoring";
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

export type NpReportDisplayOk = {
  ok: true;
  variant: "live" | "demo";
  /** `null` when `variant === "demo"` (no persisted assessment to export). */
  assessmentId: string | null;
  report: NpAssessmentReportModel;
  aiPayload: AiSummaryPayload;
  responses: Record<string, NpAnswerValue>;
  executive: ReturnType<typeof buildExecutiveReportModel>;
};

export type NpReportDisplayResult =
  | { ok: false; reason: "no_catalog" }
  | { ok: false; reason: "no_submission" }
  | NpReportDisplayOk;

/**
 * Full assessment report + executive inputs: live submitted assessment, or demo-tenant illustrative data when none exists.
 */
export async function resolveNpAssessmentReportDisplay(
  organizationId: string,
  assessmentId: string | undefined,
): Promise<NpReportDisplayResult> {
  const categories = await loadNpAssessmentCatalogFromDb();
  if (categories.length === 0) {
    return { ok: false, reason: "no_catalog" };
  }

  const bundle = await loadCompletedReportBundle(organizationId, assessmentId);
  if (bundle.kind === "live") {
    return {
      ok: true,
      variant: "live",
      assessmentId: bundle.assessmentId,
      report: bundle.report,
      aiPayload: bundle.aiPayload,
      responses: bundle.responses,
      executive: bundle.executive,
    };
  }

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { isDemoTenant: true },
  });
  if (!org?.isDemoTenant) {
    return { ok: false, reason: "no_submission" };
  }

  const responses = demoResponsesForCategories(categories);
  const report = computeNpAssessmentReport(categories, responses);
  const aiPayload = buildAiSummaryPayload(report, questionsMapFromCategories(categories));
  const pillarCards = computeStandardsPillarCards(categories, responses);
  const executive = buildExecutiveReportModel(report, pillarCards);

  return {
    ok: true,
    variant: "demo",
    assessmentId: null,
    report,
    aiPayload,
    responses,
    executive,
  };
}
