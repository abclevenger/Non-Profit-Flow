import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { StandardsHubClient } from "@/components/np-assessment/StandardsHubClient";
import { coerceOrgMembershipRole } from "@/lib/organizations/membershipRole";
import { canPerformNpAssessmentAction } from "@/lib/np-assessment/np-assessment-permissions";
import { demoResponsesForCategories } from "@/lib/np-assessment/demo-responses";
import { loadNpAssessmentCatalogFromDb } from "@/lib/np-assessment/load-catalog";
import { loadCompletedReportBundle } from "@/lib/np-assessment/report-page-data";
import { computeNpAssessmentReport } from "@/lib/np-assessment/scoring";
import { computeStandardsPillarCards } from "@/lib/np-assessment/standards-dashboard-model";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = {
  title: "Standards dashboard | Non-Profit Flow",
};

export default async function StandardsDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const organizationId = session.user.activeOrganizationId;
  if (!organizationId) {
    redirect("/overview");
  }

  const role = coerceOrgMembershipRole(session.user.membershipRole ?? "VIEWER");
  if (!canPerformNpAssessmentAction(role, session.user.isPlatformAdmin, "view_report")) {
    redirect("/forbidden?reason=assessment-report");
  }

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { isDemoTenant: true },
  });

  const categories = await loadNpAssessmentCatalogFromDb();
  if (categories.length === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-stone-200/90 bg-white p-8 text-center text-sm text-stone-600 shadow-sm">
        <p>Assessment catalog is not loaded. Run the database seed for nonprofit assessment categories.</p>
      </div>
    );
  }

  if (org?.isDemoTenant) {
    const responses = demoResponsesForCategories(categories);
    const report = computeNpAssessmentReport(categories, responses);
    const pillarCards = computeStandardsPillarCards(categories, responses);
    return <StandardsHubClient report={report} pillarCards={pillarCards} variant="demo" />;
  }

  const bundle = await loadCompletedReportBundle(organizationId, undefined);
  if (bundle.kind !== "live") {
    return (
      <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-stone-200/90 bg-white p-8 text-center shadow-sm">
        <h1 className="font-serif text-xl font-semibold text-stone-900">Standards dashboard</h1>
        <p className="text-sm text-stone-600">
          This view uses your latest <span className="font-medium">completed</span> organizational assessment. Submit an
          assessment first to see live pillar scores—no sample data is shown for production organizations.
        </p>
        <Link
          href="/assessment"
          className="inline-flex rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm"
          style={{ backgroundColor: "var(--accent-color, #6b5344)" }}
        >
          Go to assessments
        </Link>
      </div>
    );
  }

  const report = computeNpAssessmentReport(categories, bundle.responses);
  const pillarCards = computeStandardsPillarCards(categories, bundle.responses);
  return <StandardsHubClient report={report} pillarCards={pillarCards} variant="live" />;
}
