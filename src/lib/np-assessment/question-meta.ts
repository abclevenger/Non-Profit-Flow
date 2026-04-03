import type { ComplianceRelevance, NpSeedQuestion } from "./question-bank/types";
import type { NpRatingType } from "./scoring";
import type { StandardsPillarId } from "./standards-framework";
import { pillarIdForAssessmentCategorySlug } from "./standards-framework";

export type { ComplianceRelevance };

export type EnrichedQuestion = NpSeedQuestion & {
  pillarId: StandardsPillarId;
  complianceRelevance: ComplianceRelevance;
};

export function defaultComplianceRelevance(
  pillarId: StandardsPillarId,
  rating: NpRatingType,
): ComplianceRelevance {
  if (pillarId === "legal_compliance" || pillarId === "governance") {
    if (rating === "E") return "high";
    if (rating === "R") return "medium";
    return "low";
  }
  if (rating === "E") return "high";
  if (rating === "R") return "medium";
  return "low";
}

export function enrichQuestion(q: NpSeedQuestion, assessmentCategorySlug: string): EnrichedQuestion {
  const pillarId = q.pillarId ?? pillarIdForAssessmentCategorySlug(assessmentCategorySlug);
  const complianceRelevance = q.complianceRelevance ?? defaultComplianceRelevance(pillarId, q.rating);
  return { ...q, pillarId, complianceRelevance };
}
