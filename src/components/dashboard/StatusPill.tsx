import type { RiskLevel, StrategicPriorityStatus } from "@/lib/mock-data/types";

export type PillTone =
  | "low"
  | "medium"
  | "high"
  | "default"
  | "positive"
  | "attention"
  | "onTrack"
  | "atRisk"
  | "offTrack";

const toneClass: Record<PillTone, string> = {
  low: "bg-emerald-50 text-emerald-900 ring-emerald-200/80",
  medium: "bg-amber-50 text-amber-950 ring-amber-200/80",
  high: "bg-rose-50 text-rose-900 ring-rose-200/80",
  default: "bg-stone-100 text-stone-800 ring-stone-200/80",
  positive: "bg-emerald-50 text-emerald-900 ring-emerald-200/80",
  attention: "bg-orange-50 text-orange-950 ring-orange-200/80",
  onTrack: "bg-emerald-50 text-emerald-900 ring-emerald-200/80",
  atRisk: "bg-amber-50 text-amber-950 ring-amber-200/80",
  offTrack: "bg-rose-50 text-rose-900 ring-rose-200/80",
};

function riskToTone(status: RiskLevel): PillTone {
  if (status === "Low") return "low";
  if (status === "Medium") return "medium";
  return "high";
}

function strategicPriorityToTone(status: StrategicPriorityStatus): PillTone {
  if (status === "On Track") return "onTrack";
  if (status === "At Risk") return "atRisk";
  return "offTrack";
}

export type StatusPillProps = {
  label: string;
  tone?: PillTone;
  riskLevel?: RiskLevel;
  strategicStatus?: StrategicPriorityStatus;
};

export function StatusPill({
  label,
  tone = "default",
  riskLevel,
  strategicStatus,
}: StatusPillProps) {
  const t = strategicStatus
    ? strategicPriorityToTone(strategicStatus)
    : riskLevel
      ? riskToTone(riskLevel)
      : tone;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${toneClass[t]}`}
    >
      {label}
    </span>
  );
}