import type { StrategicPriority } from "@/lib/mock-data/types";
import { ProgressCard } from "./ProgressCard";

export type PriorityListProps = {
  priorities: StrategicPriority[];
  showAlignment?: boolean;
};

export function PriorityList({ priorities, showAlignment }: PriorityListProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {priorities.map((p) => (
        <ProgressCard key={p.id} {...p} showAlignment={showAlignment} />
      ))}
    </div>
  );
}