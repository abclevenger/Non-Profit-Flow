import type { SampleProfileId } from "@/lib/mock-data/types";

const IDS: SampleProfileId[] = ["communityNonprofit", "growingNonprofit", "privateSchool"];

export function isSampleProfileId(v: string): v is SampleProfileId {
  return (IDS as readonly string[]).includes(v);
}
