"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GcReviewStatusPill } from "@/components/gc-review/GcReviewStatusPill";
import { useGcReviewData } from "@/components/gc-review/GcReviewProviders";
import {
  GC_ITEM_TYPE_LABEL,
  GC_QUEUE_HEADING,
  GC_STATUS_LABEL,
  type GcItemType,
  type GcStatusKey,
  type GcUrgencyKey,
  GC_URGENCY_LABEL,
} from "@/lib/gc-review/constants";
import { canAccessGcReviewQueue } from "@/lib/gc-review/permissions";
import type { GcReviewFullJson, GcReviewPublicJson } from "@/lib/gc-review/serialize";
import { useDemoMode } from "@/lib/demo-mode-context";

const URGENCY_ORDER: GcUrgencyKey[] = ["HIGH_RISK", "TIME_SENSITIVE", "STANDARD"];

function urgencyRank(k: GcUrgencyKey) {
  const i = URGENCY_ORDER.indexOf(k);
  return i === -1 ? 99 : i;
}

function fmtDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function GeneralCounselPage() {
  const { organizationId, organization } = useDemoMode();
  const { data: session, status } = useSession();
  const { items, summary, dataVersion, refetch, canExpand } = useGcReviewData();
  const [fullMap, setFullMap] = useState<Record<string, GcReviewFullJson>>({});
  const [loadingFull, setLoadingFull] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterUrgency, setFilterUrgency] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortKey, setSortKey] = useState<"flagged" | "urgency" | "type" | "status">("flagged");

  const loadFull = useCallback(async () => {
    if (!canExpand || !organizationId) return;
    setLoadingFull(true);
    try {
      const q = new URLSearchParams({ organizationId, expand: "gc" });
      const res = await fetch(`/api/gc-review?${q}`);
      if (!res.ok) return;
      const data = (await res.json()) as { items: GcReviewFullJson[] };
      const m: Record<string, GcReviewFullJson> = {};
      for (const it of data.items) m[it.id] = it;
      setFullMap(m);
    } finally {
      setLoadingFull(false);
    }
  }, [organizationId, canExpand]);

  useEffect(() => {
    void loadFull();
  }, [loadFull, dataVersion]);

  const queueAllowed = status === "authenticated" && session?.user?.role && canAccessGcReviewQueue(session.user.role);

  const filteredSorted = useMemo(() => {
    let rows = [...items];
    if (filterStatus !== "all") {
      rows = rows.filter((r) => r.statusKey === filterStatus);
    }
    if (filterUrgency !== "all") {
      rows = rows.filter((r) => r.urgencyKey === filterUrgency);
    }
    if (filterType !== "all") {
      rows = rows.filter((r) => r.itemType === filterType);
    }
    rows.sort((a, b) => {
      if (sortKey === "urgency") {
        const d = urgencyRank(a.urgencyKey) - urgencyRank(b.urgencyKey);
        if (d !== 0) return d;
      }
      if (sortKey === "type") {
        const c = a.itemTypeLabel.localeCompare(b.itemTypeLabel);
        if (c !== 0) return c;
      }
      if (sortKey === "status") {
        const c = a.statusLabel.localeCompare(b.statusLabel);
        if (c !== 0) return c;
      }
      return new Date(b.flaggedAt).getTime() - new Date(a.flaggedAt).getTime();
    });
    return rows;
  }, [items, filterStatus, filterUrgency, filterType, sortKey]);

  return (
    <div className="space-y-8 pb-16">
      <div>
        <Link href="/overview" className="text-sm font-semibold text-stone-800 underline-offset-4 hover:underline">
          Back to overview
        </Link>
      </div>

      <header className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-stone-900">{GC_QUEUE_HEADING}</h1>
        <p className="max-w-2xl text-sm text-stone-600">
          Items flagged from across the dashboard. Counsel and administrators can update status and notes; everyone else
          can see what is in the queue without sensitive review details.
        </p>
        {summary ? (
          <p className="text-sm text-stone-700">
            <span className="font-medium text-stone-900">{summary.pendingCount}</span> open ·{" "}
            <span className="font-medium text-rose-800">{summary.highRiskOpenCount}</span> high-risk · Organization:{" "}
            <span className="font-medium">{organization?.name ?? "—"}</span>
          </p>
        ) : null}
      </header>

      {!queueAllowed ? (
        <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm ring-1 ring-stone-100/80">
          <p className="text-sm text-stone-700">
            Status updates and review notes are limited to <strong>General Counsel</strong> and{" "}
            <strong>Administrators</strong>. You can still flag new items from votes, agendas, and other modules.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 text-sm text-stone-600">
          {loadingFull ? <span>Syncing full records…</span> : null}
          <button
            type="button"
            onClick={() => void loadFull().then(() => refetch())}
            className="rounded-lg border border-stone-200/90 bg-white px-3 py-1.5 font-semibold text-stone-800 hover:bg-stone-50"
          >
            Refresh
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-3 rounded-2xl border border-stone-200/80 bg-white/90 p-4 shadow-sm ring-1 ring-stone-100/80">
        <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wide text-stone-500">
          Status
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-stone-200/90 bg-white px-2 py-2 text-sm font-normal text-stone-900"
          >
            <option value="all">All</option>
            {(Object.keys(GC_STATUS_LABEL) as GcStatusKey[]).map((k) => (
              <option key={k} value={k}>
                {GC_STATUS_LABEL[k]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wide text-stone-500">
          Urgency
          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
            className="rounded-lg border border-stone-200/90 bg-white px-2 py-2 text-sm font-normal text-stone-900"
          >
            <option value="all">All</option>
            {(Object.keys(GC_URGENCY_LABEL) as GcUrgencyKey[]).map((k) => (
              <option key={k} value={k}>
                {GC_URGENCY_LABEL[k]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wide text-stone-500">
          Item type
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg border border-stone-200/90 bg-white px-2 py-2 text-sm font-normal text-stone-900"
          >
            <option value="all">All</option>
            {(Object.keys(GC_ITEM_TYPE_LABEL) as GcItemType[]).map((k) => (
              <option key={k} value={k}>
                {GC_ITEM_TYPE_LABEL[k]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wide text-stone-500">
          Sort by
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as typeof sortKey)}
            className="rounded-lg border border-stone-200/90 bg-white px-2 py-2 text-sm font-normal text-stone-900"
          >
            <option value="flagged">Date flagged</option>
            <option value="urgency">Urgency</option>
            <option value="type">Item type</option>
            <option value="status">Status</option>
          </select>
        </label>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm ring-1 ring-stone-100/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-stone-50 text-xs font-bold uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Flagged by</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Urgency</th>
                <th className="px-4 py-3 font-medium">Deadline</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {queueAllowed ? <th className="px-4 py-3 font-medium">Review</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/80">
              {filteredSorted.length === 0 ? (
                <tr>
                  <td colSpan={queueAllowed ? 8 : 7} className="px-4 py-8 text-center text-stone-500">
                    No items match these filters.
                  </td>
                </tr>
              ) : (
                filteredSorted.map((row) => (
                  <GcQueueRow
                    key={row.id}
                    row={row}
                    full={fullMap[row.id]}
                    colSpan={queueAllowed ? 8 : 7}
                    queueAllowed={queueAllowed}
                    expanded={expandedId === row.id}
                    onToggle={() => setExpandedId((id) => (id === row.id ? null : row.id))}
                    onSaved={() => {
                      void refetch();
                      void loadFull();
                    }}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function GcQueueRow({
  row,
  full,
  colSpan,
  queueAllowed,
  expanded,
  onToggle,
  onSaved,
}: {
  row: GcReviewPublicJson;
  full?: GcReviewFullJson;
  colSpan: number;
  queueAllowed: boolean;
  expanded: boolean;
  onToggle: () => void;
  onSaved: () => void;
}) {
  return (
    <>
      <tr className="bg-white align-top hover:bg-stone-50/80">
        <td className="px-4 py-3 font-medium text-stone-900">{row.itemTitle}</td>
        <td className="px-4 py-3 text-stone-600">{row.itemTypeLabel}</td>
        <td className="px-4 py-3 text-stone-600">{row.flaggedByName ?? "—"}</td>
        <td className="px-4 py-3 text-stone-600">{fmtDate(row.flaggedAt)}</td>
        <td className="px-4 py-3 text-stone-600">{row.urgencyLabel}</td>
        <td className="px-4 py-3 text-stone-600">{row.relatedDeadline ? fmtDate(row.relatedDeadline) : "—"}</td>
        <td className="px-4 py-3">
          <GcReviewStatusPill statusKey={row.statusKey} />
        </td>
        {queueAllowed ? (
          <td className="px-4 py-3">
            <button
              type="button"
              onClick={onToggle}
              className="text-sm font-semibold text-stone-800 underline-offset-4 hover:underline"
            >
              {expanded ? "Close" : "Update"}
            </button>
          </td>
        ) : null}
      </tr>
      {queueAllowed && expanded ? (
        <tr className="bg-violet-50/30">
          <td colSpan={colSpan} className="px-4 py-4">
            {full ? (
              <GcReviewUpdateForm key={full.id} item={full} onSaved={onSaved} onCancel={onToggle} />
            ) : (
              <p className="text-sm text-stone-600">Loading review details…</p>
            )}
          </td>
        </tr>
      ) : null}
    </>
  );
}

function GcReviewUpdateForm({
  item,
  onSaved,
  onCancel,
}: {
  item: GcReviewFullJson;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [status, setStatus] = useState<GcStatusKey>(item.statusKey);
  const [reviewNotes, setReviewNotes] = useState(item.reviewNotes ?? "");
  const [recommendation, setRecommendation] = useState(item.recommendation ?? "");
  const [nextStep, setNextStep] = useState(item.nextStep ?? "");
  const [completedAt, setCompletedAt] = useState(
    item.reviewCompletedAt ? item.reviewCompletedAt.slice(0, 10) : "",
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch(`/api/gc-review/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          reviewNotes: reviewNotes.trim() || null,
          recommendation: recommendation.trim() || null,
          nextStep: nextStep.trim() || null,
          reviewCompletedAt: completedAt.trim() ? new Date(completedAt).toISOString() : null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Save failed");
      onSaved();
      onCancel();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4 rounded-xl border border-violet-200/60 bg-white p-5 shadow-sm ring-1 ring-violet-100/50">
      <p className="text-xs font-bold uppercase tracking-wide text-stone-500">Counsel review (restricted)</p>
      <div className="grid gap-3 text-sm text-stone-700 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold text-stone-500">Reason</p>
          <p className="mt-1">{item.reason}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-stone-500">Summary of concern</p>
          <p className="mt-1">{item.summaryConcern}</p>
        </div>
        {item.supportingNotes ? (
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold text-stone-500">Supporting notes</p>
            <p className="mt-1 whitespace-pre-wrap">{item.supportingNotes}</p>
          </div>
        ) : null}
      </div>

      <label className="block text-xs font-bold uppercase tracking-wide text-stone-500">
        Status
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as GcStatusKey)}
          className="mt-1 w-full rounded-lg border border-stone-200/90 bg-white px-3 py-2 text-sm font-normal text-stone-900"
        >
          {(Object.keys(GC_STATUS_LABEL) as GcStatusKey[]).map((k) => (
            <option key={k} value={k}>
              {GC_STATUS_LABEL[k]}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-xs font-bold uppercase tracking-wide text-stone-500">
        Review notes
        <textarea
          value={reviewNotes}
          onChange={(e) => setReviewNotes(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-stone-200/90 bg-stone-50/50 px-3 py-2 text-sm text-stone-900"
        />
      </label>
      <label className="block text-xs font-bold uppercase tracking-wide text-stone-500">
        Recommendation
        <textarea
          value={recommendation}
          onChange={(e) => setRecommendation(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-stone-200/90 bg-stone-50/50 px-3 py-2 text-sm text-stone-900"
        />
      </label>
      <label className="block text-xs font-bold uppercase tracking-wide text-stone-500">
        Next step
        <textarea
          value={nextStep}
          onChange={(e) => setNextStep(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-stone-200/90 bg-stone-50/50 px-3 py-2 text-sm text-stone-900"
        />
      </label>
      <label className="block text-xs font-bold uppercase tracking-wide text-stone-500">
        Review completion date
        <input
          type="date"
          value={completedAt}
          onChange={(e) => setCompletedAt(e.target.value)}
          className="mt-1 w-full rounded-lg border border-stone-200/90 bg-white px-3 py-2 text-sm text-stone-900"
        />
      </label>

      {err ? <p className="text-sm text-rose-700">{err}</p> : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
          style={{ backgroundColor: "var(--demo-accent, #6b5344)" }}
        >
          {saving ? "Saving…" : "Save review"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-stone-200/90 px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
