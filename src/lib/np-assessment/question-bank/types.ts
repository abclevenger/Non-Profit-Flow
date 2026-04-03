import type { StandardsPillarId } from "../standards-framework";

export type NpSeedRating = "E" | "R" | "A";

export type ComplianceRelevance = "high" | "medium" | "low";

export type NpSeedQuestion = {
  code: string;
  rating: NpSeedRating;
  text: string;
  displayOrder: number;
  /** Override default mapping from assessment category → nonprofit standards pillar */
  pillarId?: StandardsPillarId;
  /** Regulatory / fiduciary emphasis for filtering and AI context */
  complianceRelevance?: ComplianceRelevance;
};

export type NpSeedCategory = {
  slug: string;
  name: string;
  displayOrder: number;
  questions: NpSeedQuestion[];
};
