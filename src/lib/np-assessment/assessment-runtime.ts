import "server-only";

import type { NpAnswerValue } from "./answers";
import { isFlaggedAnswer } from "./answers";
import { prisma } from "@/lib/prisma";
import {
  buildAiSummaryPayload,
  computeNpAssessmentReport,
  questionsMapFromCategories,
  type AiSummaryPayload,
  type NpAssessmentReportModel,
} from "./scoring";
import { loadNpAssessmentCatalogFromDb } from "./load-catalog";
import type { NpSeedCategory } from "./question-bank/types";

export async function ensureParticipant(assessmentId: string, userId: string) {
  const existing = await prisma.npAssessmentParticipant.findFirst({
    where: { assessmentId, userId },
  });
  if (existing) return existing;
  return prisma.npAssessmentParticipant.create({
    data: { assessmentId, userId, isAnonymous: false },
  });
}

export async function getQuestionsByIndicatorCodes(codes: string[]) {
  if (codes.length === 0) return [];
  return prisma.npAssessmentQuestion.findMany({
    where: { indicatorCode: { in: codes } },
    select: { id: true, indicatorCode: true },
  });
}

export type SaveResponseItem = {
  indicatorCode: string;
  answer: NpAnswerValue;
  notes?: string | null;
};

export async function saveAssessmentResponses(
  assessmentId: string,
  participantId: string,
  userId: string,
  items: SaveResponseItem[],
) {
  const assessment = await prisma.npAssessment.findUnique({
    where: { id: assessmentId },
    select: { status: true },
  });
  if (
    assessment?.status === "COMPLETED" ||
    assessment?.status === "ARCHIVED" ||
    assessment?.status === "SUBMITTED"
  ) {
    throw new Error("This assessment is no longer editable.");
  }

  const codes = [...new Set(items.map((i) => i.indicatorCode))];
  const questions = await getQuestionsByIndicatorCodes(codes);
  const byCode = new Map(questions.map((q) => [q.indicatorCode, q.id]));

  for (const item of items) {
    const questionId = byCode.get(item.indicatorCode);
    if (!questionId) continue;
    const flagged = isFlaggedAnswer(item.answer);
    await prisma.npAssessmentResponse.upsert({
      where: {
        participantId_questionId: { participantId, questionId },
      },
      create: {
        assessmentId,
        participantId,
        questionId,
        answer: item.answer,
        notes: item.notes?.trim() || null,
        flaggedForConsult: flagged,
        completedByUserId: userId,
      },
      update: {
        answer: item.answer,
        notes: item.notes?.trim() || null,
        flaggedForConsult: flagged,
        completedByUserId: userId,
      },
    });
  }

  await prisma.npAssessment.update({
    where: { id: assessmentId },
    data: {
      status: "IN_PROGRESS",
    },
  });
}

export async function responsesRecordForParticipant(
  participantId: string,
  categories: NpSeedCategory[],
): Promise<Record<string, NpAnswerValue>> {
  const allCodes = categories.flatMap((c) => c.questions.map((q) => q.code));
  const questions = await prisma.npAssessmentQuestion.findMany({
    where: { indicatorCode: { in: allCodes } },
    select: { id: true, indicatorCode: true },
  });
  const idToCode = new Map(questions.map((q) => [q.id, q.indicatorCode]));

  const rows = await prisma.npAssessmentResponse.findMany({
    where: { participantId },
  });

  const out: Record<string, NpAnswerValue> = {};
  for (const r of rows) {
    const code = idToCode.get(r.questionId);
    if (code && (r.answer === "MET" || r.answer === "NEEDS_WORK" || r.answer === "NA" || r.answer === "DONT_KNOW")) {
      out[code] = r.answer as NpAnswerValue;
    }
  }
  return out;
}

export async function countAnsweredForParticipant(participantId: string): Promise<number> {
  const n = await prisma.npAssessmentResponse.count({ where: { participantId } });
  return n;
}

export async function submitAssessment(
  assessmentId: string,
  participantId: string,
  userId: string,
  categories: NpSeedCategory[],
) {
  const assessment = await prisma.npAssessment.findUnique({
    where: { id: assessmentId },
    select: { status: true },
  });
  if (assessment?.status === "COMPLETED" || assessment?.status === "SUBMITTED") {
    throw new Error("Assessment already submitted.");
  }

  const totalQs = categories.reduce((s, c) => s + c.questions.length, 0);
  const answered = await prisma.npAssessmentResponse.count({ where: { participantId } });
  if (answered < totalQs) {
    throw new Error(`Incomplete assessment: ${answered}/${totalQs} questions answered.`);
  }

  const responses = await responsesRecordForParticipant(participantId, categories);
  const report = computeNpAssessmentReport(categories, responses);
  const qMap = questionsMapFromCategories(categories);
  const aiPayload = buildAiSummaryPayload(report, qMap);
  const payload = JSON.stringify({ report, aiPayload, responses, submittedByUserId: userId, submittedAt: new Date().toISOString() });

  await prisma.$transaction([
    prisma.npAssessment.update({
      where: { id: assessmentId },
      data: {
        status: "COMPLETED",
        submittedAt: new Date(),
        currentCategoryIndex: categories.length - 1,
      },
    }),
    prisma.npAssessmentReport.create({
      data: {
        assessmentId,
        participantId,
        payload,
      },
    }),
  ]);

  return { report, aiPayload };
}

export async function getLatestStoredReport(assessmentId: string): Promise<{
  report: NpAssessmentReportModel;
  aiPayload: AiSummaryPayload;
  responses: Record<string, NpAnswerValue>;
} | null> {
  const row = await prisma.npAssessmentReport.findFirst({
    where: { assessmentId },
    orderBy: { generatedAt: "desc" },
  });
  if (!row?.payload) return null;
  try {
    const parsed = JSON.parse(row.payload) as {
      report: NpAssessmentReportModel;
      aiPayload: AiSummaryPayload;
      responses?: Record<string, NpAnswerValue>;
    };
    if (!parsed?.report || !parsed?.aiPayload) return null;
    return {
      report: parsed.report,
      aiPayload: parsed.aiPayload,
      responses: parsed.responses ?? {},
    };
  } catch {
    return null;
  }
}

export async function loadAssessmentWorkspaceForUser(assessmentId: string, userId: string) {
  const assessment = await prisma.npAssessment.findUnique({
    where: { id: assessmentId },
    include: { organization: { select: { id: true, name: true } } },
  });
  if (!assessment) return null;
  const participant = await ensureParticipant(assessmentId, userId);
  const categories = await loadNpAssessmentCatalogFromDb();
  const responses = await responsesRecordForParticipant(participant.id, categories);
  const answeredCount = await prisma.npAssessmentResponse.count({ where: { participantId: participant.id } });
  const totalQuestions = categories.reduce((s, c) => s + c.questions.length, 0);
  return {
    assessment,
    participantId: participant.id,
    categories,
    responses,
    answeredCount,
    totalQuestions,
  };
}