/**
 * Nonprofit Standards Framework — structured pillars for governance & compliance.
 * Content is original, actionable framing inspired by sector best-practice themes
 * (e.g. networks like the [National Council of Nonprofits](https://www.councilofnonprofits.org/));
 * it does not reproduce third-party materials.
 */

export type StandardsPillarId =
  | "governance"
  | "legal_compliance"
  | "financial_management"
  | "hr_staff_volunteers"
  | "strategic_planning"
  | "fundraising_development"
  | "public_relations_marketing"
  | "risk_management";

export type StandardsPillar = {
  id: StandardsPillarId;
  /** Short label for UI */
  label: string;
  /** One-line purpose for tooltips / AI context */
  summary: string;
  displayOrder: number;
};

export const NONPROFIT_STANDARDS_PILLARS: StandardsPillar[] = [
  {
    id: "governance",
    label: "Governance",
    summary: "Board roles, oversight, policies, and ethical leadership structures.",
    displayOrder: 1,
  },
  {
    id: "legal_compliance",
    label: "Legal & compliance",
    summary: "Filings, registrations, tax, lobbying, and other regulatory obligations.",
    displayOrder: 2,
  },
  {
    id: "financial_management",
    label: "Financial management",
    summary: "Budgets, internal controls, reporting, and sustainable fiscal practices.",
    displayOrder: 3,
  },
  {
    id: "hr_staff_volunteers",
    label: "HR (staff & volunteers)",
    summary: "People practices, handbooks, safety, and volunteer stewardship.",
    displayOrder: 4,
  },
  {
    id: "strategic_planning",
    label: "Strategic planning",
    summary: "Mission alignment, plans, measurement, and stakeholder engagement.",
    displayOrder: 5,
  },
  {
    id: "fundraising_development",
    label: "Fundraising & development",
    summary: "Ethical fundraising, donor stewardship, and resource development.",
    displayOrder: 6,
  },
  {
    id: "public_relations_marketing",
    label: "Public relations & marketing",
    summary: "Communications, transparency, and community-facing integrity.",
    displayOrder: 7,
  },
  {
    id: "risk_management",
    label: "Risk management",
    summary: "Identification, mitigation, and board-level risk oversight.",
    displayOrder: 8,
  },
];

/** Maps assessment workbook section slugs (PDF / seed) → framework pillar. */
export const ASSESSMENT_CATEGORY_TO_PILLAR: Record<string, StandardsPillarId> = {
  legal: "legal_compliance",
  governance: "governance",
  "hr-staff": "hr_staff_volunteers",
  "hr-volunteers": "hr_staff_volunteers",
  "strategic-planning": "strategic_planning",
  "market-research": "strategic_planning",
  advertising: "public_relations_marketing",
  "public-relations": "public_relations_marketing",
  "customer-service": "public_relations_marketing",
  financial: "financial_management",
  fundraising: "fundraising_development",
};

export function pillarIdForAssessmentCategorySlug(slug: string): StandardsPillarId {
  return ASSESSMENT_CATEGORY_TO_PILLAR[slug] ?? "risk_management";
}

export const STANDARDS_POSITIONING = {
  title: "Nonprofit Standards Framework",
  subtitle: "Based on nonprofit best-practice standards",
  disclaimer:
    "This framework summarizes widely used nonprofit operating themes into actionable checks. It is not legal advice and does not reproduce or endorse any single third-party curriculum. Use it alongside qualified counsel and your state nonprofit association.",
  referenceLabel: "Learn more about the nonprofit sector",
  referenceUrl: "https://www.councilofnonprofits.org/",
} as const;
