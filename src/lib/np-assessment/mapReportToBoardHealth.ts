import type { CategoryScoreBlock } from "./scoring";
import type { GovernanceItem } from "@/lib/mock-data/types";

/** Maps assessment category scores to the governance health card row shape (real data only). */
export function categoryBlocksToBoardHealthItems(blocks: CategoryScoreBlock[]): GovernanceItem[] {
  return [...blocks]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((c) => {
      const flagged = c.needsWork + c.dontKnow + c.na;
      return {
        label: c.name,
        detail: `${c.met} Met · ${flagged} not Met / N/A / Don’t know`,
        status: c.consultRecommended ? "Consult suggested" : "On track",
      };
    });
}
