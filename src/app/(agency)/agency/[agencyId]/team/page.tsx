import { prisma } from "@/lib/prisma";
import { AgencyTeamManagement } from "@/components/agency-dashboard/AgencyTeamManagement";
import { getAgencyDashboardAccess } from "@/lib/agency-dashboard/access";
import { loadAgencyTeam } from "@/lib/agency-dashboard/data";

export const dynamic = "force-dynamic";

export default async function AgencyTeamPage({ params }: { params: Promise<{ agencyId: string }> }) {
  const { agencyId } = await params;
  const access = await getAgencyDashboardAccess(agencyId);
  if (!access) return null;

  const [team, agencyAccounts] = await Promise.all([
    loadAgencyTeam(agencyId),
    prisma.organization.findMany({
      where: { agencyId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-stone-900">Agency team members</h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-600">
          Agency-level operators (owner, admins, staff). Assign client workspaces with <span className="font-medium">Staff</span>{" "}
          memberships without changing board or org admin roles.
        </p>
      </div>

      <AgencyTeamManagement
        agencyId={agencyId}
        members={team}
        agencyAccounts={agencyAccounts}
        canManage={access.canManageAgency}
      />
    </div>
  );
}
