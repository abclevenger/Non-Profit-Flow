import type { StrategicPriority } from "@/lib/mock-data/types";

export type StrategicInsightCalloutProps = {
  priorities: StrategicPriority[];
};

export function StrategicInsightCallout({ priorities }: StrategicInsightCalloutProps) {
  const onTrack = priorities.filter((p) => p.status === "On Track").length;
  const atRisk = priorities.filter((p) => p.status === "At Risk").length;
  const offTrack = priorities.filter((p) => p.status === "Off Track").length;

  const parts: string[] = [];
  if (onTrack) parts.push(`${onTrack} ${onTrack === 1 ? "priority" : "priorities"} on track`);
  if (atRisk) parts.push(`${atRisk} need${atRisk === 1 ? "s" : ""} attention`);
  if (offTrack) parts.push(`${offTrack} off track`);

  const summary = parts.length ? parts.join(" · ") : "No priorities listed yet.";

  return (
    <aside
      className="rounded-xl border border-stone-200/80 bg-white/80 px-4 py-3 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200/50 backdrop-blur-sm"
      role="status"
    >
      <p className="font-medium text-stone-900">What needs attention</p>
      <p className="mt-1 leading-relaxed">{summary}</p>
    </aside>
  );
}