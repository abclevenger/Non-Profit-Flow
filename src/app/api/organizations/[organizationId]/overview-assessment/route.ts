import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { assertOrgAccess } from "@/lib/organizations/orgAccess";
import { coerceOrgMembershipRole } from "@/lib/organizations/membershipRole";
import {
  canAccessAssessmentHub,
  canPerformNpAssessmentAction,
} from "@/lib/np-assessment/np-assessment-permissions";
import { demoResponsesForCategories } from "@/lib/np-assessment/demo-responses";
import { loadNpAssessmentCatalogFromDb } from "@/lib/np-assessment/load-catalog";
import { loadCompletedReportBundle } from "@/lib/np-assessment/report-page-data";
import { responsesMergedForAssessment } from "@/lib/np-assessment/assessment-runtime";
import { computeNpAssessmentReport } from "@/lib/np-assessment/scoring";
import { computeStandardsPillarCards } from "@/lib/np-assessment/standards-dashboard-model";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ organizationId: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const session = await auth();
  const { organizationId } = await ctx.params;
  const access = await assertOrgAccess(session, organizationId);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const role = coerceOrgMembershipRole(session?.user?.membershipRole ?? "VIEWER");
  const isPlatform = Boolean(session?.user?.isPlatformAdmin);

  const canSee =
    isPlatform ||
    canPerformNpAssessmentAction(role, false, "view_report") ||
    canAccessAssessmentHub(role, false);

  if (!canSee) {
    return NextResponse.json({ eligible: false as const });
  }

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { isDemoTenant: true },
  });

  const categories = await loadNpAssessmentCatalogFromDb();
  const totalQuestions = categories.reduce((s, c) => s + c.questions.length, 0);

  const bundle = await loadCompletedReportBundle(organizationId, undefined);

  const openRun = await prisma.npAssessment.findFirst({
    where: {
      organizationId,
      NOT: { status: { in: ["COMPLETED", "SUBMITTED", "ARCHIVED"] } },
    },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, status: true, updatedAt: true },
  });

  let openRunProgress: {
    id: string;
    title: string;
    status: string;
    answeredCount: number;
    totalQuestions: number;
  } | null = null;

  if (openRun && totalQuestions > 0) {
    const merged = await responsesMergedForAssessment(openRun.id, categories);
    openRunProgress = {
      id: openRun.id,
      title: openRun.title,
      status: openRun.status,
      answeredCount: Object.keys(merged).length,
      totalQuestions,
    };
  }

  const canCreateAssessment = canPerformNpAssessmentAction(role, isPlatform, "create");
  const isDemoTenant = Boolean(org?.isDemoTenant);

  if (bundle.kind !== "live") {
    if (isDemoTenant && totalQuestions > 0) {
      const responses = demoResponsesForCategories(categories);
      const report = computeNpAssessmentReport(categories, responses);
      const pillarCards = computeStandardsPillarCards(categories, responses);
      return NextResponse.json({
        eligible: true as const,
        isDemoTenant,
        completed: {
          assessmentId: "__demo_seeded__",
          demoSeeded: true as const,
          consultBanner: report.consultBanner,
          essentialFlaggedCount: report.essentialFlaggedCount,
          categoriesNeedingConsult: report.categoriesNeedingConsult,
          overall: report.overall,
          pillarCards,
        },
        openRun: openRunProgress,
        canCreateAssessment,
        catalogQuestionCount: totalQuestions,
      });
    }

    return NextResponse.json({
      eligible: true as const,
      isDemoTenant,
      completed: null,
      openRun: openRunProgress,
      canCreateAssessment,
      catalogQuestionCount: totalQuestions,
    });
  }

  const { assessmentId, report, responses } = bundle;
  const pillarCards = computeStandardsPillarCards(categories, responses);
  return NextResponse.json({
    eligible: true as const,
    isDemoTenant,
    completed: {
      assessmentId,
      demoSeeded: false as const,
      consultBanner: report.consultBanner,
      essentialFlaggedCount: report.essentialFlaggedCount,
      categoriesNeedingConsult: report.categoriesNeedingConsult,
      overall: report.overall,
      pillarCards,
    },
    openRun: openRunProgress,
    canCreateAssessment,
    catalogQuestionCount: totalQuestions,
  });
}
