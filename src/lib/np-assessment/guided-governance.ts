import type { StandardsPillarId } from "./standards-framework";
import type { PillarStatus } from "./standards-dashboard-model";

/**
 * Original guidance — not copied from external curricula. Use with counsel and local associations.
 */
export type GuidedBlock = {
  whatGoodLooksLike: string;
  recommendedActions: string[];
  nextSteps: string[];
};

const GUIDANCE: Record<StandardsPillarId, GuidedBlock> = {
  governance: {
    whatGoodLooksLike:
      "The board owns strategy and oversight; roles versus management are clear; key policies are current and reviewed; meetings are prepared and documented.",
    recommendedActions: [
      "Calendar an annual governance review (bylaws, conflicts, committees).",
      "Confirm written role definitions for chair, officers, and committees.",
      "Ensure minutes reflect decisions, attendance, and follow-ups.",
    ],
    nextSteps: ["Policy packet refresh", "Board orientation update", "Compliance calendar for filings"],
  },
  legal_compliance: {
    whatGoodLooksLike:
      "Registrations and tax filings are timely; payroll and benefits rules are followed; material risks are disclosed to the board and advisors.",
    recommendedActions: [
      "Reconcile filing calendar with finance and HR leads.",
      "Document lobbying or gaming activities if applicable.",
      "Maintain centralized corporate records and determination letter.",
    ],
    nextSteps: ["990 / state annual report deadline check", "Sales / payroll tax review", "Legal counsel spot-check"],
  },
  financial_management: {
    whatGoodLooksLike:
      "Timely, accurate statements; board-approved budget; segregation of duties; documented internal controls and reserve thinking.",
    recommendedActions: [
      "Publish budget vs. actuals to finance committee quarterly.",
      "Review restricted fund tracking and grant compliance.",
      "Stress-test cash flow and reserve targets.",
    ],
    nextSteps: ["Control matrix update", "Audit / independent review scheduling", "Investment policy attestation"],
  },
  hr_staff_volunteers: {
    whatGoodLooksLike:
      "Current handbook; fair hiring practices; documented roles; volunteer orientation and recognition; time tracking where required.",
    recommendedActions: [
      "Refresh handbook acknowledgement process.",
      "Align job descriptions with supervision and evaluation cycles.",
      "Standardize volunteer onboarding and safety training.",
    ],
    nextSteps: ["HR compliance checklist", "Volunteer agreement templates", "Supervisor training"],
  },
  strategic_planning: {
    whatGoodLooksLike:
      "Mission and outcomes are clear; plan ties programs to measurable goals; stakeholders inform priorities; progress is reviewed.",
    recommendedActions: [
      "Facilitate a short strategic refresh with board and staff.",
      "Tie grants and programs to outcome indicators.",
      "Communicate priorities to donors and community partners.",
    ],
    nextSteps: ["Theory of change sketch", "Dashboard of 3–5 KPIs", "Annual plan roll-down to budgets"],
  },
  fundraising_development: {
    whatGoodLooksLike:
      "Ethical solicitation; board engagement in development; documented gift acceptance; clear donor communications and stewardship.",
    recommendedActions: [
      "Review gift acceptance and naming policies.",
      "Align CRM / accounting for restricted gifts.",
      "Train board ambassadors on key messages.",
    ],
    nextSteps: ["Campaign readiness checklist", "Donor retention cadence", "Grant calendar alignment"],
  },
  public_relations_marketing: {
    whatGoodLooksLike:
      "Accurate public messaging; accessibility; crisis comms basics; alignment between marketing and programs.",
    recommendedActions: [
      "Audit website and key donor-facing materials for accuracy.",
      "Document spokespersons and approval flow.",
      "Coordinate program stories with development.",
    ],
    nextSteps: ["Style guide refresh", "Media Q&A template", "Accessibility pass on core pages"],
  },
  risk_management: {
    whatGoodLooksLike:
      "Top risks identified; insurance reviewed; incidents escalated; cybersecurity and data basics addressed.",
    recommendedActions: [
      "Run a lightweight risk register workshop with leadership.",
      "Review D&O and general liability coverage vs. activities.",
      "Document business continuity for critical programs.",
    ],
    nextSteps: ["Risk register template", "Incident response draft", "Vendor / data handling review"],
  },
};

export function getGuidedGovernance(pillarId: StandardsPillarId, status: PillarStatus): GuidedBlock | null {
  if (status === "healthy" || status === "not_assessed") return null;
  return GUIDANCE[pillarId];
}
