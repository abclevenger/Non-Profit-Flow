import type { TrainingModuleItem } from "@/lib/mock-data/types";
import { TrainingModuleCard } from "./TrainingModuleCard";

export function TrainingModuleList({ modules }: { modules: TrainingModuleItem[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {modules.map((m) => (
        <TrainingModuleCard key={m.id} module={m} />
      ))}
    </div>
  );
}
