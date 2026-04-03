import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { StartAssessmentButton } from "@/components/np-assessment/StartAssessmentButton";
import { coerceOrgMembershipRole } from "@/lib/organizations/membershipRole";
import {
  canPerformNpAssessmentAction,
  normalizeAssessmentStatus,
} from "@/lib/np-assessment/np-assessment-permissions";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Assessment | Non-Profit Flow",
};

function statusLabel(raw: string) {
  const s = normalizeAssessmentStatus(raw);
  if (s === "NOT_STARTED") return "Not started";
  if (s === "IN_PROGRESS") return "In progress";
  if (s === "COMPLETED") return "Completed";
  if (s === "ARCHIVED") return "Archived";
  return raw;
}

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
  if (!canPerformNpAssessmentAction(role, session.user.isPlatformAdmin, "fill")) {
    redirect("/forbidden?reason=assessment");
  }

  const assessments = await prisma.npAssessment.findMany({
    where: { organizationId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      updatedAt: true,
      submittedAt: true,
    },
  });

  const canCreate = canPerformNpAssessmentAction(role, session.user.isPlatformAdmin, "create");

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="font-serif text-2xl font-semibold text-stone-900">Organizational assessment</h1>
        <p className="mt-2 text-sm text-stone-600">
          Complete the multi-section checklist; responses autosave. Submit when every question is answered to generate the
          graphical report and consult flags.
        </p>
        {canCreate ? (
          <div className="mt-4">
            <StartAssessmentButton organizationId={organizationId} />
          </div>
        ) : (
          <p className="mt-3 text-xs text-stone-500">Only organization administrators can start a new assessment run.</p>
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
            {assessments.map((a) => (
              <li key={a.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-stone-900">{a.title}</p>
                  <p className="text-xs text-stone-500">
                    {statusLabel(a.status)} · Updated {a.updatedAt.toLocaleString()}
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
                  ) : a.status !== "ARCHIVED" ? (
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
            ))}
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
