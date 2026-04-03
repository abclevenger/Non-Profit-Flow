import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ExecutiveReportClient } from "@/components/np-assessment/ExecutiveReportClient";
import { coerceOrgMembershipRole } from "@/lib/organizations/membershipRole";
import { canPerformNpAssessmentAction } from "@/lib/np-assessment/np-assessment-permissions";
import { loadCompletedReportBundle } from "@/lib/np-assessment/report-page-data";

export const metadata = {
  title: "Executive report | Non-Profit Flow",
};

type Props = { searchParams: Promise<{ assessmentId?: string }> };

export default async function ExecutiveReportPage({ searchParams }: Props) {
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
  const bundle = await loadCompletedReportBundle(organizationId, sp.assessmentId);

  if (bundle.kind !== "live") {
    return (
      <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-stone-200/90 bg-white p-8 text-center shadow-sm">
        <h1 className="font-serif text-xl font-semibold text-stone-900">No executive summary yet</h1>
        <p className="text-sm text-stone-600">Submit an assessment first; this page reads your stored responses.</p>
        <Link href="/assessment" className="text-sm font-semibold text-stone-800 underline">
          Assessments
        </Link>
      </div>
    );
  }

  return (
    <ExecutiveReportClient
      report={bundle.report}
      executive={bundle.executive}
      organizationName={session.user.activeOrganization?.name ?? undefined}
    />
  );
}
