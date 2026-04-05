import Link from "next/link";
import type { AgencyNonprofitAccountDetail } from "@/lib/agency-dashboard/types";
import { AgencyHealthBadge } from "@/components/agency-dashboard/AgencyStatusBadge";
import { OpenNonprofitWorkspaceButton } from "@/components/agency-dashboard/OpenNonprofitWorkspaceButton";

export function AgencyAccountDetailView({
  agencyId,
  detail,
  canManageAgency,
}: {
  agencyId: string;
  detail: AgencyNonprofitAccountDetail;
  canManageAgency: boolean;
}) {
  const o = detail.organization;
  const h = detail.boardHealth;
  const la = detail.latestAssessment;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={`/agency/${agencyId}/accounts`}
            className="text-sm font-medium text-stone-600 hover:text-stone-900"
          >
            ← All accounts
          </Link>
          <h1 className="mt-2 font-serif text-2xl font-semibold text-stone-900">{o.name}</h1>
          <p className="mt-1 text-sm text-stone-500">{o.slug}</p>
          {o.missionSnippet ? <p className="mt-3 max-w-2xl text-sm text-stone-700">{o.missionSnippet}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-stone-600">
            {o.isDemoTenant ? (
              <span className="rounded-full bg-violet-50 px-2 py-0.5 font-semibold text-violet-900 ring-1 ring-violet-200">
                Demo tenant
              </span>
            ) : null}
            <span>Onboarding: {o.onboardingStatus}</span>
            {o.industryType ? <span>Industry: {o.industryType}</span> : null}
          </div>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wide text-stone-500">Assessment</h2>
          {la ? (
            <>
              <p className="mt-2 font-medium text-stone-900">{la.status.replace(/_/g, " ")}</p>
              <p className="mt-1 text-xs text-stone-500">Updated {la.updatedAt.toLocaleString()}</p>
            </>
          ) : (
            <p className="mt-2 text-sm text-stone-500">No assessment started.</p>
          )}
        </div>
        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wide text-stone-500">Board health</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <AgencyHealthBadge tier={h.tier} />
            {h.score !== null ? <span className="text-sm font-semibold text-stone-800">{h.score}%</span> : null}
          </div>
          <p className="mt-2 text-xs text-stone-600">
            Essential consult flags: {h.essentialConsultFlags} · Open consult items: {h.openConsultCount}
          </p>
        </div>
        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wide text-stone-500">Advisor / attorney</h2>
          <p className="mt-2 text-sm text-stone-800">{detail.assignedAdvisorLabel ?? "—"}</p>
        </div>
        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wide text-stone-500">Next meeting</h2>
          <p className="mt-2 text-sm text-stone-500">
            No meeting records in the database yet. Use the nonprofit workspace when scheduling is connected.
          </p>
        </div>
      </section>

      <section>
        <h2 className="font-serif text-lg font-semibold text-stone-900">Quick links</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <OpenNonprofitWorkspaceButton organizationId={o.id} />
          {detail.quickLinks.hasSubmittedReport && detail.quickLinks.latestAssessmentId ? (
            <Link
              href={`/assessment/report?assessmentId=${detail.quickLinks.latestAssessmentId}`}
              className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-900 shadow-sm hover:bg-stone-50"
            >
              View assessment report
            </Link>
          ) : null}
          <Link
            href="/settings/members"
            className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-900 shadow-sm hover:bg-stone-50"
          >
            Manage team
          </Link>
          {la && !["COMPLETED", "SUBMITTED", "ARCHIVED"].includes(la.status) ? (
            <Link
              href={`/assessment/take/${la.id}`}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-white shadow-sm"
              style={{ backgroundColor: "var(--agency-accent, #6b5344)" }}
            >
              {la.status === "NOT_STARTED" ? "Start assessment" : "Resume assessment"}
            </Link>
          ) : (
            <Link
              href="/assessment"
              className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-900 shadow-sm hover:bg-stone-50"
            >
              Assessments hub
            </Link>
          )}
          {canManageAgency ? (
            <Link
              href={`/agency/${agencyId}/consult`}
              className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-900 shadow-sm hover:bg-stone-50"
            >
              Consult pipeline
            </Link>
          ) : null}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-lg font-semibold text-stone-900">Recent activity</h2>
        {detail.recentActivity.length === 0 ? (
          <p className="mt-3 text-sm text-stone-500">No recent events for this account.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {detail.recentActivity.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-stone-200/90 bg-white px-4 py-3 text-sm shadow-sm ring-1 ring-stone-100/80"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="font-medium text-stone-900">{item.title}</span>
                  <span className="text-xs text-stone-500">{item.occurredAt.toLocaleString()}</span>
                </div>
                {item.detail ? <p className="mt-1 text-xs text-stone-600">{item.detail}</p> : null}
                {item.href ? (
                  <Link href={item.href} className="mt-2 inline-block text-xs font-semibold underline">
                    Open
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
