"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AgencyConsultRow } from "@/lib/agency-dashboard/types";
import { RatingTypeBadge } from "@/components/agency-dashboard/AgencyStatusBadge";
import { useAgencyHubSearch } from "@/components/agency-dashboard/AgencyShell";

export function AgencyConsultPanel({ rows }: { rows: AgencyConsultRow[] }) {
  const { query } = useAgencyHubSearch();
  const [severity, setSeverity] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let r = rows;
    if (q) {
      r = r.filter(
        (x) =>
          x.organizationName.toLowerCase().includes(q) ||
          x.summary.toLowerCase().includes(q) ||
          x.category.toLowerCase().includes(q),
      );
    }
    if (severity !== "all") {
      const s = severity.toLowerCase();
      r = r.filter((x) => x.severity.toLowerCase() === s);
    }
    const copy = [...r];
    copy.sort((a, b) => b.flaggedAt.getTime() - a.flaggedAt.getTime());
    return copy;
  }, [rows, query, severity]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["all", "HIGH", "MEDIUM", "LOW", "consult"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSeverity(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              severity === s ? "bg-stone-900 text-white" : "bg-white text-stone-600 ring-1 ring-stone-200"
            }`}
          >
            {s === "all" ? "All severities" : s}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-stone-200/90 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-stone-100 bg-stone-50/90 text-[11px] font-bold uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-4 py-3">Account</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Issue</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Flagged</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-sm text-stone-500">
                  No consult items match filters. Great signal when the queue is clear.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="hover:bg-stone-50/80">
                  <td className="px-4 py-3 font-medium text-stone-900">{r.organizationName}</td>
                  <td className="px-4 py-3 text-xs text-stone-600">{r.source === "gc_review" ? "GC review" : "Assessment"}</td>
                  <td className="px-4 py-3 text-xs text-stone-600">{r.category}</td>
                  <td className="max-w-xs px-4 py-3 text-xs text-stone-700">{r.summary}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-stone-800">{r.severity}</td>
                  <td className="px-4 py-3">
                    <RatingTypeBadge code={r.ratingType} />
                  </td>
                  <td className="px-4 py-3 text-xs text-stone-600">{r.status}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-stone-500">{r.flaggedAt.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    {r.itemHref ? (
                      <Link href={r.itemHref} className="text-xs font-semibold text-stone-800 underline">
                        Open
                      </Link>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-stone-200 bg-stone-50/80 px-4 py-3 text-sm text-stone-700">
        <span className="font-semibold text-stone-900">Schedule consult</span> — coordinate with your advisory bench
        from the nonprofit workspace or GC queue.{" "}
        <Link href="https://www.mission-impact.legal/contact" className="font-medium underline">
          Contact Mission Impact Legal
        </Link>
      </div>
    </div>
  );
}
