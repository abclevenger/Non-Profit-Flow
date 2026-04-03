import type { MeetingMinutesRecord } from "@/lib/mock-data/types";

function Step({ label, value, done }: { label: string; value?: string; done: boolean }) {
  return (
    <div className="flex gap-3">
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          done ? "bg-stone-900 text-white" : "bg-stone-200 text-stone-500"
        }`}
      >
        {done ? "✓" : ""}
      </span>
      <div>
        <p className="text-sm font-medium text-stone-900">{label}</p>
        <p className="text-xs text-stone-500">{value ?? "—"}</p>
      </div>
    </div>
  );
}

export function MinutesTimelineCard({ record }: { record: MeetingMinutesRecord }) {
  const approved = Boolean(record.approvedDate);
  const published = Boolean(record.publishedDate);
  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white/60 p-6 shadow-sm ring-1 ring-white/50 backdrop-blur-md">
      <h3 className="font-serif text-lg font-semibold text-stone-900">Record timeline</h3>
      <p className="mt-1 text-sm text-stone-600">Draft through approval and optional publishing.</p>
      <div className="mt-5 space-y-4">
        <Step label="Meeting held" value={record.meetingDate} done />
        <Step label="Draft created" value={record.draftCreatedAt ?? record.createdAt} done />
        <Step label="Sent for review" value={record.sentForReviewAt} done={Boolean(record.sentForReviewAt)} />
        <Step label="Approved" value={record.approvedDate} done={approved} />
        <Step label="Published (public)" value={record.publishedDate} done={published} />
      </div>
    </div>
  );
}
