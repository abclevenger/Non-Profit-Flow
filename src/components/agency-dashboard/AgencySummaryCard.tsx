export function AgencySummaryCard({
  label,
  value,
  hint,
  accent = "stone",
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "stone" | "emerald" | "amber" | "rose" | "sky" | "violet";
}) {
  const border =
    accent === "emerald"
      ? "border-emerald-200/80"
      : accent === "amber"
        ? "border-amber-200/80"
        : accent === "rose"
          ? "border-rose-200/80"
          : accent === "sky"
            ? "border-sky-200/80"
            : accent === "violet"
              ? "border-violet-200/80"
              : "border-stone-200/80";

  return (
    <div
      className={`rounded-2xl border ${border} bg-white/95 p-5 shadow-sm ring-1 ring-stone-100/80 backdrop-blur-sm`}
    >
      <p className="text-[11px] font-bold uppercase tracking-wide text-stone-500">{label}</p>
      <p className="mt-2 font-serif text-3xl font-semibold tabular-nums text-stone-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-stone-500">{hint}</p> : null}
    </div>
  );
}
