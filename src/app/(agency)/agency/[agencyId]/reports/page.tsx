import { AgencyReportsCharts } from "@/components/agency-dashboard/AgencyReportsCharts";
import { getAgencyDashboardAccess } from "@/lib/agency-dashboard/access";
import { loadAgencyAccounts, loadAgencyReportsRollup } from "@/lib/agency-dashboard/data";

export const dynamic = "force-dynamic";

export default async function AgencyReportsPage({ params }: { params: Promise<{ agencyId: string }> }) {
  const { agencyId } = await params;
  const access = await getAgencyDashboardAccess(agencyId);
  if (!access) return null;

  const accounts = await loadAgencyAccounts(agencyId);
  const rollup = await loadAgencyReportsRollup(agencyId, accounts);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-2xl font-semibold text-stone-900">Agency reports</h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-600">
          Rollups computed from live assessment responses and consult flags — scoped to this agency’s nonprofit accounts.
        </p>
      </header>
      <AgencyReportsCharts rollup={rollup} />
    </div>
  );
}
