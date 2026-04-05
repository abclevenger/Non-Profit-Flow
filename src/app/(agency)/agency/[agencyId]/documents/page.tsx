import Link from "next/link";
import { getAgencyDashboardAccess } from "@/lib/agency-dashboard/access";
import { getOrganizationIdsForAgency } from "@/lib/agency-dashboard/data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AgencyDocumentsPage({ params }: { params: Promise<{ agencyId: string }> }) {
  const { agencyId } = await params;
  const access = await getAgencyDashboardAccess(agencyId);
  if (!access) return null;

  const orgIds = await getOrganizationIdsForAgency(agencyId);
  const orgNames = Object.fromEntries(
    (await prisma.organization.findMany({ where: { id: { in: orgIds } }, select: { id: true, name: true } })).map(
      (o) => [o.id, o.name],
    ),
  );

  const logs =
    orgIds.length === 0
      ? []
      : await prisma.contentAccessLog.findMany({
          where: { organizationId: { in: orgIds } },
          orderBy: { createdAt: "desc" },
          take: 40,
        });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-2xl font-semibold text-stone-900">Documents & access</h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-600">
          Recent protected resource access across client accounts (from audit log). Open a nonprofit workspace for full
          document modules.
        </p>
      </header>

      <div className="rounded-2xl border border-stone-200/90 bg-white shadow-sm ring-1 ring-stone-100">
        <ul className="divide-y divide-stone-100">
          {logs.length === 0 ? (
            <li className="px-4 py-12 text-center text-sm text-stone-500">No document access events recorded yet.</li>
          ) : (
            logs.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <div>
                  <span className="font-medium text-stone-900">{l.resourceType}</span>
                  <span className="text-stone-500"> · {l.resourceKey}</span>
                  <p className="text-xs text-stone-500">
                    {l.organizationId ? orgNames[l.organizationId] ?? "Account" : "—"} · {l.createdAt.toLocaleString()}
                  </p>
                </div>
                {l.href ? (
                  <Link href={l.href} className="text-xs font-semibold text-stone-800 underline">
                    Open
                  </Link>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
