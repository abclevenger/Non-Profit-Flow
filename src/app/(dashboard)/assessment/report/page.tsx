import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AssessmentReportToolbar } from "@/components/np-assessment/AssessmentReportToolbar";
import { NpAssessmentReportView } from "@/components/np-assessment/NpAssessmentReportView";
import { coerceOrgMembershipRole } from "@/lib/organizations/membershipRole";
import { canPerformNpAssessmentAction } from "@/lib/np-assessment/np-assessment-permissions";
import { resolveNpAssessmentReportDisplay } from "@/lib/np-assessment/report-page-data";

export const metadata = {
  title: "Assessment report | Non-Profit Flow",
};

type Props = { searchParams: Promise<{ assessmentId?: string }> };

export default async function AssessmentReportPage({ searchParams }: Props) {
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

  const sp = await searchParams;
  const data = await resolveNpAssessmentReportDisplay(organizationId, sp.assessmentId);

  if (!data.ok) {
    if (data.reason === "no_catalog") {
      return (
        <div className="mx-auto max-w-lg rounded-2xl border border-stone-200/90 bg-white p-8 text-center text-sm text-stone-600 shadow-sm">
          <p>Assessment catalog is not loaded. Run the database seed for nonprofit assessment categories.</p>
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-stone-200/90 bg-white p-8 text-center shadow-sm">
        <h1 className="font-serif text-xl font-semibold text-stone-900">No report yet</h1>
        <p className="text-sm text-stone-600">
          Complete and submit an assessment to generate charts, consult flags, and exports from your real responses.
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

  return (
    <div className="space-y-4">
      {data.variant === "demo" ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2 text-xs text-amber-950">
          Demo organization: this report uses illustrative responses. CSV export unlocks after you submit a real assessment.
        </p>
      ) : null}
      <AssessmentReportToolbar organizationId={organizationId} assessmentId={data.assessmentId} />
      <NpAssessmentReportView report={data.report} aiPayload={data.aiPayload} />
    </div>
  );
}
