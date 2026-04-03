export function MeetingPublicBadge({ publicVisible }: { publicVisible: boolean }) {
  if (!publicVisible) {
    return (
      <span className="rounded-md bg-stone-100/90 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-stone-600 ring-1 ring-stone-200/70">
        Internal
      </span>
    );
  }
  return (
    <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-teal-900 ring-1 ring-teal-200/80">
      Public meeting
    </span>
  );
}
