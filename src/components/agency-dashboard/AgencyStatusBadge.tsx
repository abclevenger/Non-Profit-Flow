import type { AgencyHealthTier } from "@/lib/agency-dashboard/types";

const tierClass: Record<AgencyHealthTier, string> = {
  healthy: "bg-emerald-50 text-emerald-900 ring-emerald-200/90",
  at_risk: "bg-amber-50 text-amber-950 ring-amber-200/90",
  critical: "bg-rose-50 text-rose-900 ring-rose-200/90",
};

const tierLabel: Record<AgencyHealthTier, string> = {
  healthy: "Healthy",
  at_risk: "At risk",
  critical: "Critical",
};

export function AgencyHealthBadge({ tier }: { tier: AgencyHealthTier }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${tierClass[tier]}`}
    >
      {tierLabel[tier]}
    </span>
  );
}

export function AgencyDemoBadge() {
  return (
    <span className="inline-flex rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-900 ring-1 ring-violet-200/80">
      Demo
    </span>
  );
}

export function ConsultBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="inline-flex rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-950 ring-1 ring-sky-200/80">
      Consult · {count}
    </span>
  );
}

export function RatingTypeBadge({ code }: { code: string | null }) {
  if (!code) return null;
  const label = code === "E" ? "Essential" : code === "R" ? "Recommended" : code === "A" ? "Additional" : code;
  return (
    <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-semibold text-stone-700 ring-1 ring-stone-200/80">
      {label}
    </span>
  );
}
