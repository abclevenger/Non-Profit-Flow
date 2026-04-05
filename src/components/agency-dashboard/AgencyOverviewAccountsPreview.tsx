"use client";

import Link from "next/link";
import type { AgencyAccountRow } from "@/lib/agency-dashboard/types";
import { AgencyDemoBadge, AgencyHealthBadge, ConsultBadge } from "@/components/agency-dashboard/AgencyStatusBadge";
import { OpenNonprofitWorkspaceButton } from "@/components/agency-dashboard/OpenNonprofitWorkspaceButton";

const MAX = 12;

export function AgencyOverviewAccountsPreview({
  agencyId,
  accounts,
}: {
  agencyId: string;
  accounts: AgencyAccountRow[];
}) {
  const rows = accounts.slice(0, MAX);

  if (rows.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="font-serif text-lg font-semibold text-stone-900">Nonprofit accounts</h2>
        <Link href={`/agency/${agencyId}/accounts`} className="text-sm font-semibold text-stone-800 underline">
          View all ({accounts.length})
        </Link>
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl border border-stone-200/90 bg-white shadow-sm ring-1 ring-stone-100/80">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-wide text-stone-600">
            <tr>
              <th className="px-4 py-3">Account</th>
              <th className="px-4 py-3">Health</th>
              <th className="px-4 py-3">Consult</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((a) => (
              <tr key={a.organizationId}>
                <td className="px-4 py-3">
                  <Link
                    href={`/agency/${agencyId}/accounts/${a.organizationId}`}
                    className="font-medium text-stone-900 underline decoration-stone-300 underline-offset-2 hover:decoration-stone-600"
                  >
                    {a.name}
                  </Link>
                  {a.isDemoTenant ? (
                    <span className="ml-2">
                      <AgencyDemoBadge />
                    </span>
                  ) : null}
                  <p className="text-xs text-stone-500">{a.slug}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-1">
                    <AgencyHealthBadge tier={a.healthTier} />
                    {a.healthScore !== null ? (
                      <span className="text-xs text-stone-500">{a.healthScore}%</span>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {a.openConsultCount > 0 ? (
                    <ConsultBadge count={a.openConsultCount} />
                  ) : a.consultNeeded ? (
                    <span className="text-xs font-medium text-amber-800">Review</span>
                  ) : (
                    <span className="text-xs text-stone-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-stone-700">{a.memberCount}</td>
                <td className="px-4 py-3 text-xs text-stone-500">{a.lastUpdatedAt.toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <OpenNonprofitWorkspaceButton organizationId={a.organizationId} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
