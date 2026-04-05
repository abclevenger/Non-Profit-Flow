import { notFound } from "next/navigation";
import { AgencyAccountDetailView } from "@/components/agency-dashboard/AgencyAccountDetailView";
import { getAgencyDashboardAccess } from "@/lib/agency-dashboard/access";
import { loadAgencyNonprofitAccountDetail } from "@/lib/agency-dashboard/data";

export const dynamic = "force-dynamic";

export default async function AgencyNonprofitAccountDetailPage({
  params,
}: {
  params: Promise<{ agencyId: string; organizationId: string }>;
}) {
  const { agencyId, organizationId } = await params;
  const access = await getAgencyDashboardAccess(agencyId);
  if (!access) notFound();

  const detail = await loadAgencyNonprofitAccountDetail(agencyId, organizationId);
  if (!detail) notFound();

  return (
    <AgencyAccountDetailView agencyId={agencyId} detail={detail} canManageAgency={access.canManageAgency} />
  );
}
