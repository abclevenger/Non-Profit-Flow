import type { SampleProfileId } from "@/lib/mock-data/types";
import { isSampleProfileId } from "./validation";

/** Legacy helper for demo profile keys; branding lives on `Organization` + session now. */
export function coerceProfileId(raw: string | null): SampleProfileId | null {
  if (!raw || !isSampleProfileId(raw)) return null;
  return raw;
}
