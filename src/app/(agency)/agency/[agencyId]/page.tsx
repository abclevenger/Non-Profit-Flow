import Link from "next/link";
import { AgencyConsultOpportunitiesPreview } from "@/components/agency-dashboard/AgencyConsultOpportunitiesPreview";
import { AgencyEmptyState } from "@/components/agency-dashboard/AgencyEmptyState";
import { AgencyOverviewAccountsPreview } from "@/components/agency-dashboard/AgencyOverviewAccountsPreview";
import { AgencySummaryCard } from "@/components/agency-dashboard/AgencySummaryCard";
import { getAgencyDashboardAccess } from "@/lib/agency-dashboard/access";
import {
  loadAgencyAccounts,
  loadAgencyActivity,
  loadAgencyConsultQueue,
  loadAgencyOverviewStats,
} from "@/lib/agency-dashboard/data";

export const dynamic = "force-dynamic";

export default async function AgencyOverviewPage({ params }: { params: Promise<{ agencyId: string }> }) {
  const { agencyId } = await params;
  const access = await getAgencyDashboardAccess(agencyId);
  if (!access) return null;

  const accounts = await loadAgencyAccounts(agencyId);
  const stats = await loadAgencyOverviewStats(agencyId, accounts);
  const activity = await loadAgencyActivity(agencyId, 10);
  const consultRows = await loadAgencyConsultQueue(agencyId);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-serif text-2xl font-semibold text-stone-900">Agency overview</h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-600">
          Portfolio health, consult signals, and recent motion across every nonprofit account under this agency.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <AgencySummaryCard label="Nonprofit accounts" value={stats.nonprofitCount} accent="stone" />
        <AgencySummaryCard
          label="Active org team members"
          value={stats.activeTeamMembersAcrossOrgs}
          hint="Across all client accounts"
          accent="sky"
        />
        <AgencySummaryCard
          label="Open consult signals"
          value={stats.openConsultFlags}
          hint="GC queue + flagged assessment items"
          accent="amber"
        />
        <AgencySummaryCard
          label="Completed assessments"
          value={stats.completedAssessmentsCount}
          accent="emerald"
        />
        <AgencySummaryCard
          label="Accounts needing review"
          value={stats.accountsNeedingReview}
          hint="Risk tier or open consult"
          accent="rose"
        />
      </section>

      <section>
        <h2 className="font-serif text-lg font-semibold text-stone-900">Portfolio pipeline</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AgencySummaryCard label="Healthy" value={stats.healthyCount} accent="emerald" />
          <AgencySummaryCard label="At risk" value={stats.atRiskCount} accent="amber" />
          <AgencySummaryCard label="Critical" value={stats.criticalCount} accent="rose" />
          <AgencySummaryCard
            label="Essential flags"
            value={stats.essentialFlagsCount}
            hint="Assessment · Essential consult items"
            accent="violet"
          />
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-2">
        <AgencyOverviewAccountsPreview agencyId={agencyId} accounts={accounts} />
        <AgencyConsultOpportunitiesPreview agencyId={agencyId} rows={consultRows} />
      </div>

      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="font-serif text-lg font-semibold text-stone-900">Recent activity</h2>
          <ul className="mt-4 space-y-3">
            {activity.length === 0 ? (
              <li className="text-sm text-stone-500">No recent events yet.</li>
            ) : (
              activity.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-stone-200/90 bg-white/90 px-4 py-3 text-sm shadow-sm ring-1 ring-stone-100/80"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-stone-900">{item.title}</span>
                    <span className="text-xs text-stone-500">{item.occurredAt.toLocaleString()}</span>
                  </div>
                  <p className="mt-1 text-xs text-stone-600">{item.organizationName}</p>
                  {item.detail ? <p className="mt-1 text-xs text-stone-500">{item.detail}</p> : null}
                  {item.href ? (
                    <Link href={item.href} className="mt-2 inline-block text-xs font-semibold text-stone-800 underline">
                      Open
                    </Link>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        </div>

        <div>
          <h2 className="font-serif text-lg font-semibold text-stone-900">Quick actions</h2>
          <div className="mt-4 flex flex-col gap-2">
            {access.canManageAgency ? (
              <Link
                href={`/agency/${agencyId}/accounts/new`}
                className="rounded-xl px-4 py-3 text-center text-sm font-semibold text-white shadow-sm"
                style={{ backgroundColor: "var(--agency-accent, #6b5344)" }}
              >
                Add nonprofit account
              </Link>
            ) : (
              <p className="rounded-xl border border-dashed border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-500">
                Ask an agency admin to add accounts or invite you with elevated permissions.
              </p>
            )}
            <Link
              href={`/agency/${agencyId}/team`}
              className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-center text-sm font-semibold text-stone-900 shadow-sm hover:bg-stone-50"
            >
              Invite agency team member
            </Link>
            <Link
              href={`/agency/${agencyId}/assessments`}
              className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-center text-sm font-semibold text-stone-900 shadow-sm hover:bg-stone-50"
            >
              View assessments
            </Link>
            <Link
              href={`/agency/${agencyId}/consult`}
              className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-center text-sm font-semibold text-stone-900 shadow-sm hover:bg-stone-50"
            >
              Open consult queue
            </Link>
            <Link
              href={`/agency/${agencyId}/accounts`}
              className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-center text-sm font-semibold text-stone-900 shadow-sm hover:bg-stone-50"
            >
              Browse nonprofit accounts
            </Link>
          </div>
        </div>
      </section>

      {accounts.length === 0 ? (
        <AgencyEmptyState
          title="No accounts in this agency"
          description="Provision nonprofits from the Accounts page to populate health metrics and activity."
          action={
            access.canManageAgency ? (
              <Link
                href={`/agency/${agencyId}/accounts/new`}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm"
                style={{ backgroundColor: "var(--agency-accent, #6b5344)" }}
              >
                Add nonprofit account
              </Link>
            ) : null
          }
        />
      ) : null}
    </div>
  );
}
