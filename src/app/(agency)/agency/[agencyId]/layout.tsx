import { redirect } from "next/navigation";
import { AgencyShell } from "@/components/agency-dashboard/AgencyShell";
import { getAgencyDashboardAccess } from "@/lib/agency-dashboard/access";

export const dynamic = "force-dynamic";

export default async function AgencyDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ agencyId: string }>;
}) {
  const { agencyId } = await params;
  const access = await getAgencyDashboardAccess(agencyId);
  if (!access) {
    redirect("/forbidden?reason=agency-dashboard");
  }

  return (
    <AgencyShell
      agencyId={agencyId}
      agencyName={access.agency.name}
      isWhiteLabel={access.agency.isWhiteLabel}
      seat={access.seat}
      canManageAgency={access.canManageAgency}
    >
      {children}
    </AgencyShell>
  );
}
