import type { BoardVoteItem } from "@/lib/mock-data/types";

/**
 * COORDINATOR: Scaffold for scheduling & visibility. Connect to mutations / API later.
 * Fields mirror BoardVoteItem timing and publicVisible / followUpRequired.
 */
export function CoordinatorControlsCard({ vote }: { vote: BoardVoteItem }) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300/90 bg-stone-50/40 p-4 ring-1 ring-stone-200/50 backdrop-blur-sm">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-600">Coordinator tools (demo)</h4>
      <p className="mt-1 text-xs text-stone-500">
        Set vote windows, decision deadlines, meeting assignment, and public visibility. Not persisted in v1.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-medium text-stone-600">
          Vote opens
          <input readOnly className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-sm" value={vote.opensAt} />
        </label>
        <label className="block text-xs font-medium text-stone-600">
          Vote closes
          <input readOnly className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-sm" value={vote.closesAt} />
        </label>
        <label className="block text-xs font-medium text-stone-600">
          Decision deadline
          <input readOnly className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-sm" value={vote.decisionDate} />
        </label>
        <label className="block text-xs font-medium text-stone-600">
          Meeting / cycle
          <input readOnly className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-sm" value={vote.meetingDate ?? "—"} />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <label className="flex cursor-pointer items-center gap-2 text-stone-700">
          <input type="checkbox" readOnly checked={vote.publicVisible} className="rounded border-stone-300" />
          Public-facing summary
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-stone-700">
          <input type="checkbox" readOnly checked={vote.followUpRequired} className="rounded border-stone-300" />
          Follow-up needed
        </label>
      </div>
    </div>
  );
}