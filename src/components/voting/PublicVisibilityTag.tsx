export function PublicVisibilityTag({ publicVisible }: { publicVisible: boolean }) {
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ${
        publicVisible
          ? "bg-white/70 text-teal-900 ring-teal-200/80 backdrop-blur-sm"
          : "bg-white/50 text-stone-600 ring-stone-200/80 backdrop-blur-sm"
      }`}
    >
      {publicVisible ? "Public meeting item" : "Internal only"}
    </span>
  );
}