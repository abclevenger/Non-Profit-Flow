"use client";

import { useState, type ReactNode } from "react";
import type { StrategicPriority } from "@/lib/mock-data/types";
import { StatusPill } from "@/components/dashboard/StatusPill";

export type StrategicPriorityCardProps = {
  priority: StrategicPriority;
  /** Compact row for overview */
  compact?: boolean;
  /** When false, notes appear only in StrategicNotesPanel (strategy page) */
  showInlineNote?: boolean;
  /** Optional General Counsel flag row (parent supplies toolbar). */
  gcReviewSlot?: ReactNode;
};

export function StrategicPriorityCard({
  priority,
  compact,
  showInlineNote = true,
  gcReviewSlot,
}: StrategicPriorityCardProps) {
  const [open, setOpen] = useState(false);
  const p = priority;

  if (compact) {
    return (
      <article className="rounded-xl border border-stone-200/90 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-medium text-stone-900">{p.title}</h3>
          <StatusPill label={p.status} strategicStatus={p.status} />
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Progress</span>
            <span className="font-medium text-stone-700">{p.progress}%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-stone-100">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, Math.max(0, p.progress))}%`,
                backgroundColor: "var(--demo-accent, #6b5344)",
              }}
            />
          </div>
        </div>
        <p className="mt-2 text-xs text-stone-500">
          <span className="font-medium text-stone-600">Next milestone: </span>
          {p.nextMilestone}
        </p>
        {gcReviewSlot ? <div className="mt-3 border-t border-stone-200/80 pt-3">{gcReviewSlot}</div> : null}
      </article>
    );
  }

  return (
    <article className="rounded-xl border border-stone-200/90 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {p.category ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{p.category}</p>
          ) : null}
          <h3 className="font-serif text-lg font-semibold tracking-tight text-stone-900">{p.title}</h3>
        </div>
        <StatusPill label={p.status} strategicStatus={p.status} />
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span>Progress</span>
          <span className="font-medium text-stone-700">{p.progress}%</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(100, Math.max(0, p.progress))}%`,
              backgroundColor: "var(--demo-accent, #6b5344)",
            }}
          />
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-stone-600">{p.description}</p>

      <dl className="mt-4 grid gap-3 text-sm text-stone-600 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">Owner</dt>
          <dd className="mt-0.5 font-medium text-stone-800">{p.owner}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">Next milestone</dt>
          <dd className="mt-0.5 text-stone-700">{p.nextMilestone}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">Due date</dt>
          <dd className="mt-0.5 text-stone-700">{p.dueDate}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500">Last updated</dt>
          <dd className="mt-0.5 text-stone-700">{p.lastUpdated}</dd>
        </div>
      </dl>

      {showInlineNote ? (
        <div className="mt-4 rounded-lg bg-stone-50/90 px-3 py-2 ring-1 ring-stone-200/70">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Latest note</p>
          <p className="mt-1 text-sm text-stone-700">{p.notes}</p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-4 text-sm font-medium text-stone-600 underline-offset-4 transition-colors hover:text-stone-900 hover:underline"
        aria-expanded={open}
      >
        {open ? "Hide details" : "Show details"}
      </button>

      {open ? (
        <div className="mt-3 space-y-3 border-t border-stone-200/80 pt-4 text-sm text-stone-600">
          {p.alignmentNote ? (
            <p>
              <span className="font-medium text-stone-800">Strategic alignment. </span>
              {p.alignmentNote}
            </p>
          ) : (
            <p className="text-stone-500">
              Further updates, board decisions, and agenda links can appear here in a future version.
            </p>
          )}
        </div>
      ) : null}
      {gcReviewSlot ? <div className="mt-4 border-t border-stone-200/80 pt-4">{gcReviewSlot}</div> : null}
    </article>
  );
}