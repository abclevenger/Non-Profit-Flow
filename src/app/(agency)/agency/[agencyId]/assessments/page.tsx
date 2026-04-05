import Link from "next/link";
import { getAgencyDashboardAccess } from "@/lib/agency-dashboard/access";
import { getOrganizationIdsForAgency } from "@/lib/agency-dashboard/data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AgencyAssessmentsPage({ params }: { params: Promise<{ agencyId: string }> }) {
  const { agencyId } = await params;
  const access = await getAgencyDashboardAccess(agencyId);
  if (!access) return null;

  const orgIds = await getOrganizationIdsForAgency(agencyId);
  const assessments =
    orgIds.length === 0
      ? []
      : await prisma.npAssessment.findMany({
          where: { organizationId: { in: orgIds } },
          orderBy: { updatedAt: "desc" },
          include: { organization: { select: { name: true } } },
        });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-2xl font-semibold text-stone-900">Assessments</h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-600">
          All organizational assessment runs for nonprofits in this agency.
        </p>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-stone-200/90 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-stone-100 bg-stone-50/90 text-[11px] font-bold uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-4 py-3">Nonprofit</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {assessments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-stone-500">
                  No assessments yet. Start one from a nonprofit workspace.
                </td>
              </tr>
            ) : (
              assessments.map((a) => (
                <tr key={a.id} className="hover:bg-stone-50/80">
                  <td className="px-4 py-3 font-medium text-stone-900">{a.organization.name}</td>
                  <td className="px-4 py-3 text-stone-700">{a.title}</td>
                  <td className="px-4 py-3 text-xs">{a.status}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-stone-500">{a.updatedAt.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={
                        a.status === "COMPLETED" || a.status === "SUBMITTED"
                          ? `/assessment/report?assessmentId=${a.id}`
                          : `/assessment/take/${a.id}`
                      }
                      className="text-xs font-semibold text-stone-800 underline"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
