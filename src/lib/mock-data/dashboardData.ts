import type { OrganizationProfile, SampleProfileId } from "./types";
import { communityNonprofitProfile } from "./profiles/communityNonprofit";
import { growingNonprofitProfile } from "./profiles/growingNonprofit";
import { privateSchoolProfile } from "./profiles/privateSchool";

const profiles: Record<SampleProfileId, OrganizationProfile> = {
  communityNonprofit: communityNonprofitProfile,
  growingNonprofit: growingNonprofitProfile,
  privateSchool: privateSchoolProfile,
};

/**
 * Demo data entry. Add a profile file under profiles/ and register it here.
 */
export function getDashboardProfile(id: SampleProfileId): OrganizationProfile {
  return profiles[id];
}

export const SAMPLE_PROFILE_OPTIONS: { id: SampleProfileId; label: string }[] = [
  { id: "communityNonprofit", label: "Small Community Nonprofit" },
  { id: "growingNonprofit", label: "Growing Multi-Program Nonprofit" },
  { id: "privateSchool", label: "Private School / Faith-Based Organization" },
];

export * from "./types";
export { genericSample } from "./genericSample";
export { customizedPreview } from "./customizedPreview";