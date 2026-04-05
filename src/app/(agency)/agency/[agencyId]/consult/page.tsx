import { AgencyConsultPipeline } from "@/components/agency-dashboard/AgencyConsultPipeline";
import { getAgencyDashboardAccess } from "@/lib/agency-dashboard/access";
import { loadAgencyConsultPipeline } from "@/lib/agency-dashboard/data";

export const dynamic = "force-dynamic";

export default async function AgencyConsultPage({ params }: { params: Promise<{ agencyId: string }> }) {
  const { agencyId } = await params;
  const access = await getAgencyDashboardAccess(agencyId);
  if (!access) return null;

  const rows = await loadAgencyConsultPipeline(agencyId);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-2xl font-semibold text-stone-900">Consult pipeline</h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-600">
          Live queue across assessment consult flags, general counsel reviews, and expert review requests for every
          nonprofit under this agency. Use search in the header to narrow by account or keyword.
        </p>
      </header>
      <AgencyConsultPipeline rows={rows} />
    </div>
  );
}
