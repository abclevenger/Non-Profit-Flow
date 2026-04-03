"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { ExpertReviewStatusPill } from "@/components/expert-review/ExpertReviewStatusPill";
import { useExpertReviewData } from "@/components/expert-review/ExpertReviewProviders";
import {
  EXPERT_REVIEW_CATEGORY_KEYS,
  EXPERT_REVIEW_CATEGORY_LABEL,
  EXPERT_PRIORITY_KEYS,
  EXPERT_PRIORITY_LABEL,
  EXPERT_STATUS_KEYS,
  EXPERT_STATUS_LABEL,
  REVIEW_REQUESTS_QUEUE_TITLE,
} from "@/lib/expert-review/constants";
import { canAccessReviewsQueue } from "@/lib/expert-review/permissions";
import type { ExpertReviewPublicJson } from "@/lib/expert-review/serialize";
import { useDemoMode } from "@/lib/demo-mode-context";

function fmt(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function ReviewsQueuePage() {
  const { organizationId, organization } = useDemoMode();
  const { data: session, status } = useSession();
  const { items: ctxItems, refetch, canSubmit } = useExpertReviewData();
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const allowed = status === "authenticated" && session?.user?.role && canAccessReviewsQueue(session.user.role);

  useEffect(() => {
    void refetch();
  }, [refetch, organizationId]);

  const filtered = useMemo(() => {
    let rows = [...ctxItems];
    if (filterCategory !== "all") rows = rows.filter((r) => r.category === filterCategory);
    if (filterStatus !== "all") rows = rows.filter((r) => r.status === filterStatus);
    if (filterPriority !== "all") rows = rows.filter((r) => r.priority === filterPriority);
    return rows;
  }, [ctxItems, filterCategory, filterStatus, filterPriority]);

  if (status === "loading") {
    return <p className="text-sm text-stone-500">Loading…</p>;
  }

  if (!allowed) {
    return (
      <div className="rounded-2xl border border-stone-200/80 bg-white p-6">
        <p className="text-sm text-stone-700">Sign in with a board or staff role to view review requests.</p>
        <Link href="/login" className="mt-4 inline-block text-sm font-semibold underline">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div>
        <Link href="/overview" className="text-sm font-semibold text-stone-800 underline-offset-4 hover:underline">
          Back to overview
        </Link>
      </div>
      <header>
        <h1 className="font-serif text-3xl font-semibold text-stone-900">{REVIEW_REQUESTS_QUEUE_TITLE}</h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-600">
          Routed requests for <span className="font-medium text-stone-800">{organization?.name ?? "your organization"}</span>
          . {session?.user?.canViewAllExpertReviewsInOrg ? "You can see all requests in this organization." : "You see requests you submitted."}
        </p>
      </header>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-stone-200/80 bg-white/90 p-4 shadow-sm ring-1 ring-stone-100/80">
        <FilterSelect
          label="Category"
          value={filterCategory}
          onChange={setFilterCategory}
          options={[
            { v: "all", l: "All" },
            ...EXPERT_REVIEW_CATEGORY_KEYS.map((k) => ({ v: k, l: EXPERT_REVIEW_CATEGORY_LABEL[k] })),
          ]}
        />
        <FilterSelect
          label="Status"
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { v: "all", l: "All" },
            ...EXPERT_STATUS_KEYS.map((k) => ({ v: k, l: EXPERT_STATUS_LABEL[k] })),
          ]}
        />
        <FilterSelect
          label="Priority"
          value={filterPriority}
          onChange={setFilterPriority}
          options={[
            { v: "all", l: "All" },
            ...EXPERT_PRIORITY_KEYS.map((k) => ({ v: k, l: EXPERT_PRIORITY_LABEL[k] })),
          ]}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm ring-1 ring-stone-100/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-stone-50 text-xs font-bold uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Destination</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-stone-500">
                    No requests match these filters.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => <ReviewRow key={row.id} row={row} />)
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!canSubmit ? (
        <p className="text-xs text-stone-500">Guest accounts cannot submit new requests.</p>
      ) : null}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { v: string; l: string }[];
}) {
  return (
    <label className="flex flex-col gap-1 text-xs font-bold uppercase tracking-wide text-stone-500">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-stone-200/90 bg-white px-2 py-2 text-sm font-normal text-stone-900"
      >
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.l}
          </option>
        ))}
      </select>
    </label>
  );
}

function ReviewRow({ row }: { row: ExpertReviewPublicJson }) {
  return (
    <tr className="align-top hover:bg-stone-50/80">
      <td className="px-4 py-3 text-stone-700">{row.categoryLabel}</td>
      <td className="px-4 py-3">
        <p className="font-medium text-stone-900">{row.subject}</p>
        {row.relatedHref ? (
          <Link href={row.relatedHref} className="mt-1 text-xs font-semibold text-stone-600 underline-offset-2 hover:underline">
            Open related item
          </Link>
        ) : null}
      </td>
      <td className="px-4 py-3 text-xs text-stone-600">{row.destinationEmail}</td>
      <td className="px-4 py-3 text-stone-600">{row.priorityLabel}</td>
      <td className="px-4 py-3">
        <ExpertReviewStatusPill statusKey={row.status} />
      </td>
      <td className="px-4 py-3 text-stone-600">{fmt(row.createdAt)}</td>
    </tr>
  );
}
