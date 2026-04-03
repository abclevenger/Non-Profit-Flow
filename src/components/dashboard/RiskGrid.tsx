import type { RiskItem } from "@/lib/mock-data/types";
import { RiskCard } from "./RiskCard";

export type RiskGridProps = { risks: RiskItem[] };

export function RiskGrid({ risks }: RiskGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {risks.map((r) => (
        <RiskCard key={r.category} {...r} />
      ))}
    </div>
  );
}