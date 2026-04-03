import type { SampleProfileId } from "@/lib/mock-data/types";

const ALLOWED: SampleProfileId[] = ["communityNonprofit", "growingNonprofit", "privateSchool"];

export function parseGcProfileId(value: string | null | undefined): SampleProfileId | null {
  if (!value || typeof value !== "string") return null;
  return ALLOWED.includes(value as SampleProfileId) ? (value as SampleProfileId) : null;
}
