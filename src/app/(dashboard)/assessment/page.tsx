import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { StartAssessmentButton } from "@/components/np-assessment/StartAssessmentButton";
import { coerceOrgMembershipRole } from "@/lib/organizations/membershipRole";
import {
  canAccessAssessmentHub,
  canFillNpAssessmentWizard,
  canPerformNpAssessmentAction,
  assessmentStatusUiLabel,
} from "@/lib/np-assessment/np-assessment-permissions";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Assessment | Non-Profit Flow",
};

export default async function AssessmentHubPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const organizationId = session.user.activeOrganizationId;
  if (!organizationId) {
    redirect("/overview");
  }
  const role = coerceOrgMembershipRole(session.user.membershipRole ?? "VIEWER");
  const isPlatform = session.user.isPlatformAdmin;
  if (!canAccessAssessmentHub(role, isPlatform)) {
    redirect("/forbidden?reason=assessment");
  }

  const assessments = await prisma.npAssessment.findMany({
    where: { organizationId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      allowBoardMemberFill: true,
      updatedAt: true,
      submittedAt: true,
    },
  });

  const canCreate = canPerformNpAssessmentAction(role, isPlatform, "create");

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="font-serif text-2xl font-semibold text-stone-900">Organizational assessment</h1>
        <p className="mt-2 text-sm text-stone-600">
          Complete the multi-section checklist; responses autosave by section. Organization admins and the board chair can
          submit when all questions are answered (live organizations). Demo tenants may submit with gaps for practice.
        </p>
        {canCreate ? (
          <div className="mt-4">
            <StartAssessmentButton organizationId={organizationId} />
          </div>
        ) : (
          <p className="mt-3 text-xs text-stone-500">
            Only organization administrators can start a new assessment run. Advisors can open completed reports from the
            links below.
          </p>
        )}
      </header>

      <section className="rounded-2xl border border-stone-200/90 bg-white shadow-sm ring-1 ring-stone-100">
        <h2 className="border-b border-stone-100 px-5 py-4 font-serif text-lg font-semibold text-stone-900">
          Your runs
        </h2>
        {assessments.length === 0 ? (
          <p className="px-5 py-8 text-sm text-stone-600">No assessments yet. Start one above.</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {assessments.map((a) => {
              const canContinue =
                a.status !== "ARCHIVED" &&
                a.status !== "COMPLETED" &&
                a.status !== "SUBMITTED" &&
                canFillNpAssessmentWizard(role, isPlatform, a.allowBoardMemberFill);
              return (
                <li key={a.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-stone-900">{a.title}</p>
                    <p className="text-xs text-stone-500">
                      {assessmentStatusUiLabel(a.status)} · Updated {a.updatedAt.toLocaleString()}
                      {a.submittedAt ? ` · Submitted ${a.submittedAt.toLocaleString()}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {a.status === "COMPLETED" || a.status === "SUBMITTED" ? (
                      <Link
                        href={`/assessment/report?assessmentId=${a.id}`}
                        className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm font-semibold text-stone-900"
                      >
                        View report
                      </Link>
                    ) : null}
                    {canContinue ? (
                      <Link
                        href={`/assessment/take/${a.id}`}
                        className="rounded-lg px-3 py-1.5 text-sm font-semibold text-white shadow-sm"
                        style={{ backgroundColor: "var(--accent-color, #6b5344)" }}
                      >
                        Continue
                      </Link>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="text-center text-sm text-stone-500">
        <Link href="/assessment/report" className="font-medium text-stone-800 underline-offset-4 hover:underline">
          Open latest completed report
        </Link>
        {" · "}
        <Link href="/assessment/executive-report" className="font-medium text-stone-800 underline-offset-4 hover:underline">
          Executive summary
        </Link>
      </p>
    </div>
  );
}
