import type { NpAnswerValue } from "./answers";
import { NP_ANSWER_LABEL } from "./answers";
import { isFlaggedAnswer, isRiskStyleAnswer } from "./answers";
import { enrichQuestion } from "./question-meta";
import type { NpSeedCategory } from "./question-bank/types";
import type { NpAssessmentReportModel } from "./scoring";
import { NONPROFIT_STANDARDS_PILLARS, type StandardsPillarId } from "./standards-framework";

export type PillarStatus = "not_assessed" | "healthy" | "at_risk" | "critical";

export type StandardsPillarCard = {
  pillarId: StandardsPillarId;
  label: string;
  summary: string;
  status: PillarStatus;
  percentMet: number;
  answered: number;
  totalQuestions: number;
  flaggedCount: number;
  essentialFlagged: number;
  consultRecommended: boolean;
  /** Linked assessment category names that feed this pillar (for this build) */
  sourceCategoryNames: string[];
};

function emptyPillar(pillarId: StandardsPillarId): StandardsPillarCard {
  const p = NONPROFIT_STANDARDS_PILLARS.find((x) => x.id === pillarId)!;
  return {
    pillarId,
    label: p.label,
    summary: p.summary,
    status: "not_assessed",
    percentMet: 0,
    answered: 0,
    totalQuestions: 0,
    flaggedCount: 0,
    essentialFlagged: 0,
    consultRecommended: false,
    sourceCategoryNames: [],
  };
}

/**
 * Roll up assessment categories into the eight nonprofit standards pillars.
 */
export function computeStandardsPillarCards(
  categories: NpSeedCategory[],
  responses: Record<string, NpAnswerValue | undefined>,
): StandardsPillarCard[] {
  const byPillar = new Map<
    StandardsPillarId,
    {
      total: number;
      answered: number;
      met: number;
      flagged: number;
      essentialFlagged: number;
      riskFlags: number;
      sources: Set<string>;
    }
  >();

  for (const pid of NONPROFIT_STANDARDS_PILLARS.map((p) => p.id)) {
    byPillar.set(pid, {
      total: 0,
      answered: 0,
      met: 0,
      flagged: 0,
      essentialFlagged: 0,
      riskFlags: 0,
      sources: new Set(),
    });
  }

  for (const cat of categories) {
    for (const q of cat.questions) {
      const eq = enrichQuestion(q, cat.slug);
      const bucket = byPillar.get(eq.pillarId)!;
      bucket.total += 1;
      bucket.sources.add(cat.name);
      const a = responses[q.code];
      if (a == null) continue;
      bucket.answered += 1;
      if (a === "MET") bucket.met += 1;
      if (isFlaggedAnswer(a)) {
        bucket.flagged += 1;
        if (q.rating === "E") bucket.essentialFlagged += 1;
        if (isRiskStyleAnswer(a)) bucket.riskFlags += 1;
      }
    }
  }

  return NONPROFIT_STANDARDS_PILLARS.sort((a, b) => a.displayOrder - b.displayOrder).map((pillar) => {
    const agg = byPillar.get(pillar.id)!;
    const percentMet =
      agg.answered === 0 ? 0 : Math.round((agg.met / agg.answered) * 100);

    let status: PillarStatus = "not_assessed";
    if (agg.answered > 0) {
      if (agg.essentialFlagged > 0) status = "critical";
      else if (agg.riskFlags > 0 || percentMet < 70) status = "at_risk";
      else status = "healthy";
    }

    const consultRecommended = agg.flagged > 0;

    return {
      pillarId: pillar.id,
      label: pillar.label,
      summary: pillar.summary,
      status,
      percentMet,
      answered: agg.answered,
      totalQuestions: agg.total,
      flaggedCount: agg.flagged,
      essentialFlagged: agg.essentialFlagged,
      consultRecommended,
      sourceCategoryNames: [...agg.sources],
    };
  });
}

/** 0–100 board-facing score; higher is stronger alignment with “Met” responses and fewer Essential gaps. */
export function computeGovernanceHealthScore(report: NpAssessmentReportModel): number {
  const { percentMet, answered } = report.overall;
  if (answered === 0) return 0;
  let score = percentMet;
  score -= Math.min(25, report.essentialFlaggedCount * 3);
  score -= Math.min(15, Math.max(0, report.categoriesNeedingConsult - 1) * 5);
  return Math.max(0, Math.min(100, Math.round(score)));
}

export type ExecutiveReportModel = {
  governanceHealthScore: number;
  topRiskAreas: string[];
  priorityActions: string[];
  boardSummaryBullets: string[];
};

export function buildExecutiveReportModel(
  report: NpAssessmentReportModel,
  pillarCards: StandardsPillarCard[],
): ExecutiveReportModel {
  const governanceHealthScore = computeGovernanceHealthScore(report);

  const topRiskAreas = pillarCards
    .filter((c) => c.status === "critical" || c.status === "at_risk")
    .sort((a, b) => b.essentialFlagged - a.essentialFlagged || b.flaggedCount - a.flaggedCount)
    .slice(0, 5)
    .map((c) => c.label);

  const priorityActions = report.priorityRows.slice(0, 6).map(
    (r) =>
      `[${r.rating}] ${r.categoryName}: address “${r.questionText.slice(0, 90)}${r.questionText.length > 90 ? "…" : ""}” (${NP_ANSWER_LABEL[r.response]})`,
  );

  const boardSummaryBullets = [
    `Overall governance health index: ${governanceHealthScore}/100 (derived from self-assessment responses).`,
    `${report.overall.percentMet}% of answered items marked Met; ${report.overall.flagged} items flagged for follow-up (including N/A reviews).`,
    report.categoriesNeedingConsult > 1
      ? `Multiple practice areas need attention — an organization-wide governance review is recommended.`
      : report.categoriesNeedingConsult === 1
        ? `One primary practice area requires board or leadership attention.`
        : `No open flags in the assessed areas — maintain cadence and documentation.`,
    report.essentialFlaggedCount > 0
      ? `${report.essentialFlaggedCount} Essential-rated items are not Met; prioritize these before discretionary improvements.`
      : `No Essential items are currently flagged as not Met in assessed sections.`,
  ];

  return {
    governanceHealthScore,
    topRiskAreas: topRiskAreas.length > 0 ? topRiskAreas : ["No pillar-level risks detected in assessed sections"],
    priorityActions: priorityActions.length > 0 ? priorityActions : ["Complete or refresh the organizational assessment for actionable priorities."],
    boardSummaryBullets,
  };
}
