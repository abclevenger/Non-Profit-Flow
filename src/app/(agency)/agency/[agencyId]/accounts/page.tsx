import Link from "next/link";
import { AgencyAccountsPanel } from "@/components/agency-dashboard/AgencyAccountsPanel";
import { getAgencyDashboardAccess } from "@/lib/agency-dashboard/access";
import { loadAgencyAccounts } from "@/lib/agency-dashboard/data";

export const dynamic = "force-dynamic";

export default async function AgencyAccountsPage({ params }: { params: Promise<{ agencyId: string }> }) {
  const { agencyId } = await params;
  const access = await getAgencyDashboardAccess(agencyId);
  if (!access) return null;

  const accounts = await loadAgencyAccounts(agencyId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-stone-900">Nonprofit accounts</h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-600">
            Every client workspace under this agency — health, assessments, consult load, and fast entry to the board
            dashboard.
          </p>
        </div>
        {access.canManageAgency ? (
          <Link
            href={`/agency/${agencyId}/accounts/new`}
            className="shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
            style={{ backgroundColor: "var(--agency-accent, #6b5344)" }}
          >
            Add nonprofit account
          </Link>
        ) : null}
      </div>

      <AgencyAccountsPanel agencyId={agencyId} accounts={accounts} canManage={access.canManageAgency} />
    </div>
  );
}
