import type { NpSeedQuestion } from "./types";

/** Human Resources: Staff */
export const hrStaffQuestions: NpSeedQuestion[] = [
  {
    code: "hr-staff-01",
    rating: "E",
    displayOrder: 1,
    text: "Job descriptions for all staff positions are current, approved by leadership, and used in hiring and performance conversations.",
  },
  {
    code: "hr-staff-02",
    rating: "R",
    displayOrder: 2,
    text: "The organization maintains compliant personnel files, I-9 or local work-authorization records, and documented orientation for new employees.",
  },
  {
    code: "hr-staff-03",
    rating: "A",
    displayOrder: 3,
    text: "Staff professional development plans or training budgets are reviewed at least annually.",
  },
];

/** Human Resources: Volunteers */
export const hrVolunteersQuestions: NpSeedQuestion[] = [
  {
    code: "hr-vol-01",
    rating: "E",
    displayOrder: 1,
    text: "Volunteer roles are defined in writing with clear expectations, supervision, and safety considerations appropriate to the work.",
  },
  {
    code: "hr-vol-02",
    rating: "R",
    displayOrder: 2,
    text: "Volunteers receive orientation covering mission, confidentiality, harassment prevention, and reporting pathways where applicable.",
  },
  {
    code: "hr-vol-03",
    rating: "A",
    displayOrder: 3,
    text: "Volunteer appreciation and retention practices are reviewed with program leads at least annually.",
  },
];

export const strategicPlanningQuestions: NpSeedQuestion[] = [
  {
    code: "strat-01",
    rating: "E",
    displayOrder: 1,
    text: "A current strategic or operational plan exists with measurable goals aligned to mission and board-approved priorities.",
  },
  {
    code: "strat-02",
    rating: "R",
    displayOrder: 2,
    text: "Progress against the plan is reported to the board at least annually with course corrections documented.",
  },
  {
    code: "strat-03",
    rating: "A",
    displayOrder: 3,
    text: "Scenario or contingency planning (e.g., funding, facilities, leadership) has been discussed in the last 24 months.",
  },
];

export const marketResearchQuestions: NpSeedQuestion[] = [
  {
    code: "market-01",
    rating: "R",
    displayOrder: 1,
    text: "The organization gathers structured input from beneficiaries, donors, or community stakeholders to inform programs or positioning.",
  },
  {
    code: "market-02",
    rating: "A",
    displayOrder: 2,
    text: "Competitive or landscape scans for similar services are refreshed periodically to avoid duplication and identify partnerships.",
  },
  {
    code: "market-03",
    rating: "A",
    displayOrder: 3,
    text: "Findings from research are summarized for leadership and board decision-making (not only retained by staff).",
  },
];

export const advertisingQuestions: NpSeedQuestion[] = [
  {
    code: "ad-01",
    rating: "E",
    displayOrder: 1,
    text: "Paid or sponsored outreach complies with truth-in-advertising norms and any sector-specific rules (including charitable solicitation registration where required).",
  },
  {
    code: "ad-02",
    rating: "R",
    displayOrder: 2,
    text: "Creative and copy are reviewed for accessibility and alignment with brand and mission before publication.",
  },
  {
    code: "ad-03",
    rating: "A",
    displayOrder: 3,
    text: "Advertising performance (reach, conversion, cost) is tracked for major campaigns.",
  },
];

export const publicRelationsQuestions: NpSeedQuestion[] = [
  {
    code: "pr-01",
    rating: "E",
    displayOrder: 1,
    text: "A designated spokesperson or communications protocol exists for media and crisis situations.",
  },
  {
    code: "pr-02",
    rating: "R",
    displayOrder: 2,
    text: "Key messages and factsheets are kept current for board and staff use in public-facing conversations.",
  },
  {
    code: "pr-03",
    rating: "A",
    displayOrder: 3,
    text: "Media coverage and reputational issues are monitored and escalated to leadership when material.",
  },
];

export const customerServiceSalesQuestions: NpSeedQuestion[] = [
  {
    code: "cs-01",
    rating: "R",
    displayOrder: 1,
    text: "Channels for questions, complaints, or service requests are published and monitored with documented response expectations.",
  },
  {
    code: "cs-02",
    rating: "R",
    displayOrder: 2,
    text: "Staff and volunteers who interact with the public are trained on respectful engagement and escalation paths.",
  },
  {
    code: "cs-03",
    rating: "A",
    displayOrder: 3,
    text: "Feedback themes are summarized for program improvement at least annually.",
  },
];

export const financialActivitiesQuestions: NpSeedQuestion[] = [
  {
    code: "fin-01",
    rating: "E",
    displayOrder: 1,
    text: "Internal financial controls (segregation of duties, approval thresholds, reconciliations) are documented and operating.",
  },
  {
    code: "fin-02",
    rating: "E",
    displayOrder: 2,
    text: "The board or a committee receives accurate, timely financial statements and oversees audit or independent review as appropriate.",
  },
  {
    code: "fin-03",
    rating: "R",
    displayOrder: 3,
    text: "Budget-to-actual variance is reviewed with leadership and the board at least quarterly or per policy.",
  },
  {
    code: "fin-04",
    rating: "A",
    displayOrder: 4,
    text: "Reserve or liquidity targets are defined and reviewed in light of risk and mission delivery.",
  },
];
