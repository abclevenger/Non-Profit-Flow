import type { KeyMetric } from "@/lib/mock-data/types";

const trendArrow: Record<NonNullable<KeyMetric["trend"]>, string> = {
  up: "Trending up",
  down: "Trending down",
  flat: "Steady",
};

const toneBorder: Record<NonNullable<KeyMetric["tone"]>, string> = {
  default: "border-stone-200/90",
  positive: "border-emerald-200/80",
  neutral: "border-stone-200/90",
  attention: "border-amber-200/90",
};

export type StatCardProps = KeyMetric;

export function StatCard({ label, value, sublabel, trend, tone = "default" }: StatCardProps) {
  return (
    <div
      className={`rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${toneBorder[tone]}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</p>
      <p className="mt-2 font-serif text-3xl font-semibold text-stone-900">{value}</p>
      {sublabel ? <p className="mt-1 text-sm text-stone-600">{sublabel}</p> : null}
      {trend ? (
        <p className="mt-3 text-xs text-stone-500" aria-label={trendArrow[trend]}>
          <span className="sr-only">{trendArrow[trend]}: </span>
          {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}{" "}
          <span className="text-stone-600">{trendArrow[trend]}</span>
        </p>
      ) : null}
    </div>
  );
}