export type InsightSeverity = "info" | "attention" | "risk";

export interface GovernanceInsight {
  id: string;
  severity: InsightSeverity;
  title: string;
  detail: string;
  href: string;
  /** When set, voting page can filter to relevant votes */
  relatedVoteIds?: string[];
}
