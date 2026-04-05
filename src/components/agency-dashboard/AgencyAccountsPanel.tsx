"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AgencyAccountRow } from "@/lib/agency-dashboard/types";
import { AgencyDemoBadge, AgencyHealthBadge, ConsultBadge } from "@/components/agency-dashboard/AgencyStatusBadge";
import { AgencyEmptyState } from "@/components/agency-dashboard/AgencyEmptyState";
import { OpenNonprofitWorkspaceButton } from "@/components/agency-dashboard/OpenNonprofitWorkspaceButton";
import { useAgencyHubSearch } from "@/components/agency-dashboard/AgencyShell";

type Tab = "all" | "healthy" | "at_risk" | "critical" | "demo";

export function AgencyAccountsPanel({
  agencyId,
  accounts,
  canManage,
}: {
  agencyId: string;
  accounts: AgencyAccountRow[];
  canManage: boolean;
}) {
  const { query } = useAgencyHubSearch();
  const [tab, setTab] = useState<Tab>("all");
  const [sort, setSort] = useState<"name" | "health" | "updated">("name");

  const filtered = useMemo(() => {
    let rows = accounts;
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.slug.toLowerCase().includes(q) ||
          (a.assignedAdvisorLabel?.toLowerCase().includes(q) ?? false),
      );
    }
    if (tab === "healthy") rows = rows.filter((a) => a.healthTier === "healthy");
    if (tab === "at_risk") rows = rows.filter((a) => a.healthTier === "at_risk");
    if (tab === "critical") rows = rows.filter((a) => a.healthTier === "critical");
    if (tab === "demo") rows = rows.filter((a) => a.isDemoTenant);
    const copy = [...rows];
    copy.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "health") return (b.healthScore ?? -1) - (a.healthScore ?? -1);
      return b.lastUpdatedAt.getTime() - a.lastUpdatedAt.getTime();
    });
    return copy;
  }, [accounts, query, tab, sort]);

  if (accounts.length === 0) {
    return (
      <AgencyEmptyState
        title="No nonprofit accounts yet"
        description="Create a nonprofit workspace under this agency to manage assessments, meetings, and governance in one place."
        action={
          canManage ? (
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
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "healthy", label: "Healthy" },
    { id: "at_risk", label: "At risk" },
    { id: "critical", label: "Critical" },
    { id: "demo", label: "Demo" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              tab === t.id
                ? "bg-stone-900 text-white"
                : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50"
            }`}
          >
            {t.label}
          </button>
        ))}
        <span className="mx-2 hidden h-4 w-px bg-stone-200 sm:inline" aria-hidden />
        <label className="flex items-center gap-2 text-xs text-stone-600">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs font-medium"
          >
            <option value="name">Name</option>
            <option value="health">Health score</option>
            <option value="updated">Last updated</option>
          </select>
        </label>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-stone-200/90 bg-white shadow-sm ring-1 ring-stone-100">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-stone-100 bg-stone-50/90 text-[11px] font-bold uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-4 py-3">Nonprofit</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Assessment</th>
              <th className="px-4 py-3">Health</th>
              <th className="px-4 py-3">Consult</th>
              <th className="px-4 py-3">Advisor</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-stone-500">
                  No accounts match filters.
                </td>
              </tr>
            ) : (
              filtered.map((a) => (
                <tr key={a.organizationId} className="hover:bg-stone-50/80">
                  <td className="px-4 py-3">
                    <Link
                      href={`/agency/${agencyId}/accounts/${a.organizationId}`}
                      className="font-medium text-stone-900 underline decoration-stone-300 underline-offset-2 hover:decoration-stone-600"
                    >
                      {a.name}
                    </Link>
                    <div className="text-xs text-stone-500">{a.slug}</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {a.isDemoTenant ? <AgencyDemoBadge /> : null}
                      <AgencyHealthBadge tier={a.healthTier} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-700">{a.onboardingStatus}</td>
                  <td className="px-4 py-3 text-stone-700">
                    {a.latestAssessmentStatus ?? "—"}
                    {a.latestAssessmentId ? (
                      <div className="text-xs text-stone-500">
                        <Link href={`/assessment/report?assessmentId=${a.latestAssessmentId}`} className="underline">
                          Report
                        </Link>
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-stone-800">
                    {a.healthScore != null ? `${a.healthScore}%` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <ConsultBadge count={a.openConsultCount} />
                  </td>
                  <td className="max-w-[10rem] truncate px-4 py-3 text-xs text-stone-600">
                    {a.assignedAdvisorLabel ?? "—"}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-stone-800">{a.memberCount}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-stone-600">
                    {a.lastUpdatedAt.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap justify-end gap-1">
                      <OpenNonprofitWorkspaceButton organizationId={a.organizationId} />
                      {a.latestAssessmentId ? (
                        <Link
                          href={`/assessment/report?assessmentId=${a.latestAssessmentId}`}
                          className="rounded-lg border border-stone-200 px-2 py-1 text-xs font-semibold text-stone-800 hover:bg-stone-50"
                        >
                          View report
                        </Link>
                      ) : null}
                      {a.latestAssessmentId &&
                      a.latestAssessmentStatus &&
                      !["COMPLETED", "SUBMITTED", "ARCHIVED"].includes(a.latestAssessmentStatus) ? (
                        <Link
                          href={`/assessment/take/${a.latestAssessmentId}`}
                          className="rounded-lg px-2 py-1 text-xs font-semibold text-white shadow-sm"
                          style={{ backgroundColor: "var(--agency-accent, #6b5344)" }}
                        >
                          Resume
                        </Link>
                      ) : null}
                    </div>
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
