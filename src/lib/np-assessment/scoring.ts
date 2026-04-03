import type { NpAnswerValue } from "./answers";
import { isFlaggedAnswer, isNaReviewAnswer, isRiskStyleAnswer } from "./answers";
import type { NpSeedCategory, NpSeedQuestion } from "./question-bank/types";

export type NpRatingType = "E" | "R" | "A";

export type CategoryScoreBlock = {
  slug: string;
  name: string;
  displayOrder: number;
  totalQuestions: number;
  answered: number;
  met: number;
  needsWork: number;
  dontKnow: number;
  na: number;
  completionPercent: number;
  consultRecommended: boolean;
  /** Sum of (weight * count) for NEEDS_WORK + DONT_KNOW only */
  weightedRiskScore: number;
};

export type PriorityRow = {
  priorityRank: number;
  categorySlug: string;
  categoryName: string;
  indicatorCode: string;
  questionText: string;
  rating: NpRatingType;
  response: NpAnswerValue;
  consultRequired: boolean;
  isNaReview: boolean;
  sortTier: number;
};

export type ConsultBannerLevel = "none" | "consult" | "priority" | "urgent_category";

export type NpAssessmentReportModel = {
  categoryBlocks: CategoryScoreBlock[];
  priorityRows: PriorityRow[];
  overall: {
    totalQuestions: number;
    answered: number;
    met: number;
    flagged: number;
    percentMet: number;
    percentFlagged: number;
    weightedRiskTotal: number;
    /** N/A count (flagged but not risk-weighted) */
    naFlagged: number;
  };
  consultBanner: ConsultBannerLevel;
  urgentCategorySlugs: string[];
  essentialFlaggedCount: number;
  categoriesNeedingConsult: number;
};

const RATING_WEIGHT: Record<NpRatingType, number> = { E: 3, R: 2, A: 1 };

function priorityTier(rating: NpRatingType, answer: NpAnswerValue): number {
  if (answer === "NA") return 100;
  if (rating === "E" && answer === "NEEDS_WORK") return 1;
  if (rating === "E" && answer === "DONT_KNOW") return 2;
  if (rating === "R" && answer === "NEEDS_WORK") return 3;
  if (rating === "R" && answer === "DONT_KNOW") return 4;
  if (rating === "A" && answer === "NEEDS_WORK") return 5;
  if (rating === "A" && answer === "DONT_KNOW") return 6;
  return 99;
}

export function computeNpAssessmentReport(
  categories: NpSeedCategory[],
  responses: Record<string, NpAnswerValue | undefined>,
): NpAssessmentReportModel {
  const categoryBlocks: CategoryScoreBlock[] = [];
  const rawPriorities: Omit<PriorityRow, "priorityRank">[] = [];

  let totalMet = 0;
  let totalFlagged = 0;
  let totalAnswered = 0;
  let totalQs = 0;
  let weightedRiskTotal = 0;
  let naFlagged = 0;
  const essentialPerCategory = new Map<string, number>();

  const sortedCats = [...categories].sort((a, b) => a.displayOrder - b.displayOrder);

  for (const cat of sortedCats) {
    const qs = [...cat.questions].sort((a, b) => a.displayOrder - b.displayOrder);
    let met = 0,
      needsWork = 0,
      dontKnow = 0,
      na = 0,
      answered = 0;
    let weightedRiskScore = 0;
    let essentialFlaggedHere = 0;

    for (const q of qs) {
      totalQs += 1;
      const a = responses[q.code];
      if (a == null) continue;
      answered += 1;
      if (a === "MET") met += 1;
      else if (a === "NEEDS_WORK") needsWork += 1;
      else if (a === "DONT_KNOW") dontKnow += 1;
      else if (a === "NA") na += 1;

      if (isFlaggedAnswer(a)) {
        totalFlagged += 1;
        if (isNaReviewAnswer(a)) naFlagged += 1;
        if (isRiskStyleAnswer(a)) {
          const w = RATING_WEIGHT[q.rating];
          weightedRiskScore += w;
          weightedRiskTotal += w;
        }
        if (q.rating === "E") essentialFlaggedHere += 1;

        rawPriorities.push({
          categorySlug: cat.slug,
          categoryName: cat.name,
          indicatorCode: q.code,
          questionText: q.text,
          rating: q.rating,
          response: a,
          consultRequired: true,
          isNaReview: a === "NA",
          sortTier: priorityTier(q.rating, a),
        });
      } else {
        totalMet += 1;
      }
    }

    essentialPerCategory.set(cat.slug, essentialFlaggedHere);

    const consultRecommended = needsWork + dontKnow + na > 0;
    const completionPercent = qs.length === 0 ? 100 : Math.round((answered / qs.length) * 100);

    categoryBlocks.push({
      slug: cat.slug,
      name: cat.name,
      displayOrder: cat.displayOrder,
      totalQuestions: qs.length,
      answered,
      met,
      needsWork,
      dontKnow,
      na,
      completionPercent,
      consultRecommended,
      weightedRiskScore,
    });
  }

  rawPriorities.sort((x, y) => {
    if (x.sortTier !== y.sortTier) return x.sortTier - y.sortTier;
    const cOrder =
      sortedCats.findIndex((c) => c.slug === x.categorySlug) -
      sortedCats.findIndex((c) => c.slug === y.categorySlug);
    if (cOrder !== 0) return cOrder;
    return x.indicatorCode.localeCompare(y.indicatorCode);
  });

  const priorityRows: PriorityRow[] = rawPriorities.map((r, i) => ({
    ...r,
    priorityRank: i + 1,
  }));

  const categoriesNeedingConsult = categoryBlocks.filter((c) => c.consultRecommended).length;
  const essentialFlaggedCount = rawPriorities.filter((r) => r.rating === "E").length;

  const urgentCategorySlugs: string[] = [];
  for (const [slug, n] of essentialPerCategory) {
    if (n >= 2) urgentCategorySlugs.push(slug);
  }

  /** Severity: urgent category (2+ flagged Essential in one section) > any Essential not Met > any other not Met. */
  let consultBanner: ConsultBannerLevel = "none";
  if (urgentCategorySlugs.length > 0) consultBanner = "urgent_category";
  else if (essentialFlaggedCount > 0) consultBanner = "priority";
  else if (totalFlagged > 0) consultBanner = "consult";

  const denom = totalAnswered;
  const percentMet = denom === 0 ? 0 : Math.round((totalMet / denom) * 100);
  const percentFlagged = denom === 0 ? 0 : Math.round((totalFlagged / denom) * 100);

  return {
    categoryBlocks,
    priorityRows,
    overall: {
      totalQuestions: totalQs,
      answered: totalAnswered,
      met: totalMet,
      flagged: totalFlagged,
      percentMet,
      percentFlagged,
      weightedRiskTotal,
      naFlagged,
    },
    consultBanner,
    urgentCategorySlugs,
    essentialFlaggedCount,
    categoriesNeedingConsult,
  };
}

/** Deterministic sample responses for demo report (mix of answers). */
export function demoResponsesForCategories(categories: NpSeedCategory[]): Record<string, NpAnswerValue> {
  const out: Record<string, NpAnswerValue> = {};
  const cycle: NpAnswerValue[] = ["MET", "MET", "NEEDS_WORK", "DONT_KNOW", "NA", "MET"];
  let i = 0;
  for (const c of categories) {
    for (const q of c.questions) {
      out[q.code] = cycle[i % cycle.length]!;
      i += 1;
    }
  }
  return out;
}

export type AiSummaryPayload = {
  categoryBlocks: Pick<
    CategoryScoreBlock,
    "name" | "met" | "needsWork" | "dontKnow" | "na" | "consultRecommended" | "weightedRiskScore"
  >[];
  strongestCategories: string[];
  attentionCategories: string[];
  topEssentialFlagged: { code: string; snippet: string; response: string }[];
  overall: NpAssessmentReportModel["overall"];
};

export function buildAiSummaryPayload(
  report: NpAssessmentReportModel,
  questionsByCode: Map<string, NpSeedQuestion>,
): AiSummaryPayload {
  const byRisk = [...report.categoryBlocks].sort((a, b) => b.weightedRiskScore - a.weightedRiskScore);
  const byMet = [...report.categoryBlocks].sort((a, b) => b.met - a.met);

  const strongestCategories = byMet
    .filter((c) => c.totalQuestions > 0 && c.met >= c.totalQuestions * 0.7)
    .slice(0, 3)
    .map((c) => c.name);
  const attentionCategories = byRisk
    .filter((c) => c.consultRecommended)
    .slice(0, 4)
    .map((c) => c.name);

  const topEssentialFlagged = report.priorityRows
    .filter((r) => r.rating === "E")
    .slice(0, 8)
    .map((r) => ({
      code: r.indicatorCode,
      snippet: r.questionText.slice(0, 200) + (r.questionText.length > 200 ? "…" : ""),
      response: r.response,
    }));

  return {
    categoryBlocks: report.categoryBlocks.map((c) => ({
      name: c.name,
      met: c.met,
      needsWork: c.needsWork,
      dontKnow: c.dontKnow,
      na: c.na,
      consultRecommended: c.consultRecommended,
      weightedRiskScore: c.weightedRiskScore,
    })),
    strongestCategories:
      strongestCategories.length > 0 ? strongestCategories : byMet.slice(0, 2).map((c) => c.name),
    attentionCategories:
      attentionCategories.length > 0 ? attentionCategories : byRisk.slice(0, 2).map((c) => c.name),
    topEssentialFlagged,
    overall: report.overall,
  };
}

export function questionsMapFromCategories(categories: NpSeedCategory[]): Map<string, NpSeedQuestion> {
  const m = new Map<string, NpSeedQuestion>();
  for (const c of categories) {
    for (const q of c.questions) m.set(q.code, q);
  }
  return m;
}
