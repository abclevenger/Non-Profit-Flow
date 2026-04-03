"use client";

import type { ActionItem } from "@/lib/mock-data/types";
import { BoardItemReviewActions } from "@/components/expert-review/BoardItemReviewActions";
import { StatusPill } from "./StatusPill";

export type ActionTrackerTableProps = {
  items: ActionItem[];
  /** When set, adds a column to flag follow-ups for General Counsel review. */
  organizationIdForGc?: string;
};

export function ActionTrackerTable({ items, organizationIdForGc }: ActionTrackerTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-stone-200/90 bg-white shadow-sm">
      <div className="border-b border-stone-200/80 px-5 py-4">
        <h3 className="font-serif text-lg font-semibold text-stone-900">Open action tracker</h3>
        <p className="mt-1 text-sm text-stone-600">Items the board and leadership are watching between meetings.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-5 py-3 font-medium">Task</th>
              <th className="px-5 py-3 font-medium">Owner</th>
              <th className="px-5 py-3 font-medium">Due date</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Overdue</th>
              {organizationIdForGc ? <th className="px-5 py-3 font-medium">Legal review</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200/80">
            {items.map((row) => (
              <tr key={row.id} className={row.overdue ? "bg-amber-50/40" : undefined}>
                <td className="px-5 py-3 text-stone-800">{row.task}</td>
                <td className="px-5 py-3 text-stone-600">{row.owner}</td>
                <td className="px-5 py-3 text-stone-600">{row.dueDate}</td>
                <td className="px-5 py-3">
                  <StatusPill label={row.status} tone="default" />
                </td>
                <td className="px-5 py-3">
                  {row.overdue ? <StatusPill label="Overdue" tone="attention" /> : <span className="text-stone-400">—</span>}
                </td>
                {organizationIdForGc ? (
                  <td className="px-5 py-3 align-top">
                    <BoardItemReviewActions
                      organizationId={organizationIdForGc}
                      gcItemType="follow_up"
                      expertItemType="follow_up"
                      itemId={row.id}
                      itemTitle={row.task}
                      relatedHref="/overview"
                      compact
                    />
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
