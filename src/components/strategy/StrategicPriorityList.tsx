import type { StrategicPriority } from "@/lib/mock-data/types";
import { StrategicPriorityCard } from "./StrategicPriorityCard";

export type StrategicPriorityListProps = {
  priorities: StrategicPriority[];
  compact?: boolean;
  /** Pass false on strategy page when using StrategicNotesPanel */
  showInlineNote?: boolean;
};

export function StrategicPriorityList({
  priorities,
  compact,
  showInlineNote = true,
}: StrategicPriorityListProps) {
  const hasCategories = priorities.some((p) => p.category);

  if (!hasCategories) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        {priorities.map((p) => (
          <StrategicPriorityCard
            key={p.id}
            priority={p}
            compact={compact}
            showInlineNote={showInlineNote}
          />
        ))}
      </div>
    );
  }

  const byCat = new Map<string, StrategicPriority[]>();
  for (const p of priorities) {
    const c = p.category || "Priorities";
    if (!byCat.has(c)) byCat.set(c, []);
    byCat.get(c)!.push(p);
  }

  return (
    <div className="space-y-10">
      {[...byCat.entries()].map(([category, items]) => (
        <section key={category}>
          <h3 className="mb-4 font-serif text-base font-semibold text-stone-900">{category}</h3>
          <div className="grid gap-4 lg:grid-cols-2">
            {items.map((p) => (
              <StrategicPriorityCard
                key={p.id}
                priority={p}
                compact={compact}
                showInlineNote={showInlineNote}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}