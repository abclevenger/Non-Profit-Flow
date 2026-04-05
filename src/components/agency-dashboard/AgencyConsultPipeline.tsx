"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AgencyConsultPipelineRow } from "@/lib/agency-dashboard/types";
import { RatingTypeBadge } from "@/components/agency-dashboard/AgencyStatusBadge";
import { useAgencyHubSearch } from "@/components/agency-dashboard/AgencyShell";

const SOURCE_OPTIONS = [
  { id: "all", label: "All sources" },
  { id: "assessment_flag", label: "Assessment" },
  { id: "gc_review", label: "GC review" },
  { id: "expert_review", label: "Expert review" },
] as const;

const PIPELINE_OPTIONS = [
  { id: "all", label: "All stages" },
  { id: "new", label: "New" },
  { id: "in_review", label: "In review" },
  { id: "scheduled", label: "Scheduled" },
  { id: "resolved", label: "Resolved" },
] as const;

const SORT_OPTIONS = [
  { id: "updated", label: "Last updated" },
  { id: "severity", label: "Priority (P1 first)" },
  { id: "org", label: "Organization" },
] as const;

function pipelineLabel(s: AgencyConsultPipelineRow["pipelineStatus"]): string {
  if (s === "new") return "New";
  if (s === "in_review") return "In review";
  if (s === "scheduled") return "Scheduled";
  return "Resolved";
}

function sourceLabel(s: AgencyConsultPipelineRow["source"]): string {
  if (s === "gc_review") return "GC review";
  if (s === "expert_review") return "Expert review";
  return "Assessment";
}

export function AgencyConsultPipeline({ rows }: { rows: AgencyConsultPipelineRow[] }) {
  const { query } = useAgencyHubSearch();
  const [source, setSource] = useState<(typeof SOURCE_OPTIONS)[number]["id"]>("all");
  const [pipeline, setPipeline] = useState<(typeof PIPELINE_OPTIONS)[number]["id"]>("all");
  const [sort, setSort] = useState<(typeof SORT_OPTIONS)[number]["id"]>("updated");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let r = rows;
    if (q) {
      r = r.filter(
        (x) =>
          x.organizationName.toLowerCase().includes(q) ||
          x.issueText.toLowerCase().includes(q) ||
          x.categoryLabel.toLowerCase().includes(q) ||
          (x.assignedAdvisorLabel?.toLowerCase().includes(q) ?? false),
      );
    }
    if (source !== "all") {
      r = r.filter((x) => x.source === source);
    }
    if (pipeline !== "all") {
      r = r.filter((x) => x.pipelineStatus === pipeline);
    }
    const copy = [...r];
    copy.sort((a, b) => {
      if (sort === "org") {
        const c = a.organizationName.localeCompare(b.organizationName);
        return c !== 0 ? c : b.updatedAt.getTime() - a.updatedAt.getTime();
      }
      if (sort === "severity") {
        const pr = (p: AgencyConsultPipelineRow["priorityLevel"]) => (p === "P1" ? 0 : p === "P2" ? 1 : 2);
        const d = pr(a.priorityLevel) - pr(b.priorityLevel);
        return d !== 0 ? d : b.updatedAt.getTime() - a.updatedAt.getTime();
      }
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
    return copy;
  }, [rows, query, source, pipeline, sort]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="flex flex-wrap gap-2">
          {SOURCE_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setSource(o.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                source === o.id ? "bg-stone-900 text-white" : "bg-white text-stone-600 ring-1 ring-stone-200"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {PIPELINE_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setPipeline(o.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                pipeline === o.id ? "bg-sky-900 text-white" : "bg-white text-stone-600 ring-1 ring-stone-200"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-stone-600">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-xs font-medium"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-stone-200/90 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-stone-100 bg-stone-50/90 text-[11px] font-bold uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-3 py-3">Account</th>
              <th className="px-3 py-3">Source</th>
              <th className="px-3 py-3">Category</th>
              <th className="min-w-[12rem] px-3 py-3">Issue</th>
              <th className="px-3 py-3">Severity</th>
              <th className="px-3 py-3">Priority</th>
              <th className="px-3 py-3">Rating</th>
              <th className="px-3 py-3">Advisor</th>
              <th className="px-3 py-3">Pipeline</th>
              <th className="px-3 py-3">Created</th>
              <th className="px-3 py-3">Updated</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-14 text-center">
                  <p className="font-medium text-stone-800">No consult flags in this portfolio</p>
                  <p className="mt-2 text-sm text-stone-600">
                    When assessments surface gaps or teams flag GC / expert items, they will appear here for triage.
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="hover:bg-stone-50/80">
                  <td className="px-3 py-3 font-medium text-stone-900">{r.organizationName}</td>
                  <td className="px-3 py-3 text-xs text-stone-600">{sourceLabel(r.source)}</td>
                  <td className="px-3 py-3 text-xs text-stone-600">{r.categoryLabel}</td>
                  <td className="max-w-xs px-3 py-3 text-xs text-stone-700">{r.issueText}</td>
                  <td className="px-3 py-3 text-xs font-medium text-stone-800">{r.severity}</td>
                  <td className="px-3 py-3 text-xs font-semibold text-stone-900">{r.priorityLevel}</td>
                  <td className="px-3 py-3">
                    <RatingTypeBadge code={r.ratingType} />
                  </td>
                  <td className="max-w-[8rem] px-3 py-3 text-xs text-stone-600">
                    {r.assignedAdvisorLabel ?? "—"}
                  </td>
                  <td className="px-3 py-3 text-xs text-stone-700">{pipelineLabel(r.pipelineStatus)}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs text-stone-500">
                    {r.createdAt.toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs text-stone-500">
                    {r.updatedAt.toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-right">
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

      <div className="rounded-xl border border-stone-200 bg-amber-50/50 px-4 py-3 text-sm text-stone-800">
        <span className="font-semibold text-stone-900">Schedule consult</span> — coordinate with counsel from the
        nonprofit workspace, GC queue, or your firm&apos;s intake process.{" "}
        <a href="https://www.mission-impact.legal/contact" className="font-medium underline">
          Contact Mission Impact Legal
        </a>
      </div>
    </div>
  );
}
