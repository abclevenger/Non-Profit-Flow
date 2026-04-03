import type { GovernanceItem } from "@/lib/mock-data/types";
import { StatusPill } from "./StatusPill";

export type GovernanceHealthCardProps = { items: GovernanceItem[] };

export function GovernanceHealthCard({ items }: GovernanceHealthCardProps) {
  return (
    <div className="rounded-xl border border-stone-200/90 bg-white p-5 shadow-sm">
      <h3 className="font-serif text-lg font-semibold text-stone-900">Governance health</h3>
      <p className="mt-1 text-sm text-stone-600">
        A concise view of board and compliance routines — not a substitute for counsel or official records.
      </p>
      <ul className="mt-5 divide-y divide-stone-200/80">
        {items.map((item) => (
          <li key={item.label} className="flex flex-col gap-2 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-stone-900">{item.label}</p>
              {item.detail ? <p className="mt-1 text-sm text-stone-600">{item.detail}</p> : null}
            </div>
            <StatusPill label={item.status} tone="default" />
          </li>
        ))}
      </ul>
    </div>
  );
}