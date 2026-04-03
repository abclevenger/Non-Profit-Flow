import type { NpAnswerValue } from "./answers";
import type { NpSeedCategory } from "./question-bank/types";

/**
 * **Demo / sales tenants only.** Never use for live customer orgs — reports must come from
 * `NpAssessmentResponse` rows. @see `loadCompletedReportBundle` and `recomputeReportBundleFromDatabase`.
 */
export function demoResponsesForCategories(categories: NpSeedCategory[]): Record<string, NpAnswerValue> {
  const out: Record<string, NpAnswerValue> = {};
  const cycle: NpAnswerValue[] = ["MET", "MET", "NEEDS_WORK", "DONT_KNOW", "NA", "MET"];
  let i = 0;
  for (const c of categories) {
    for (const q of c.questions) {
      out[q.code] = cycle[i % cycle.length]!;
      i += 1;
    }
  }
  return out;
}
