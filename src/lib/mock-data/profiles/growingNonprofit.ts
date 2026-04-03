import type { OrganizationProfile } from "../types";
import { customizedPreview } from "../customizedPreview";

/** Growing multi-program nonprofit — muted blue accent. */
export const growingNonprofitProfile: OrganizationProfile = {
  ...customizedPreview,
  organizationName: "Regional Impact Alliance",
  missionSnippet:
    "Delivering multi-program services across education, workforce development, and community health.",
  theme: {
    accent: "#4a6d8c",
    accentForeground: "#f4f7fb",
    sidebarBg: "#eef2f7",
    border: "#d6dde8",
  },
  reportingPeriod: "FY2026 Q2 (through April 30)",
  boardChair: "Elena Morales",
  executiveDirector: "James Okoro",
  strategicPriorities: [
    {
      id: "gro-1",
      title: "Launch workforce training expansion",
      category: "Programs",
      description:
        "Scale credentialed training cohorts with employer partners while maintaining placement quality.",
      progress: 55,
      status: "On Track",
      owner: "Workforce programs VP",
      nextMilestone: "Employer advisory group charter approved",
      dueDate: "May 10, 2026",
      lastUpdated: "Apr 2, 2026",
      notes: "Two new employers signed LOIs; curriculum mapping halfway complete.",
    },
    {
      id: "gro-2",
      title: "Standardize program reporting",
      category: "Operations",
      description:
        "One outcomes framework across education, workforce, and health teams for board-ready transparency.",
      progress: 40,
      status: "At Risk",
      owner: "Chief of staff",
      nextMilestone: "Single dashboard prototype for leadership review",
      dueDate: "Jun 15, 2026",
      lastUpdated: "Mar 26, 2026",
      notes: "Teams use different tools; data owners still negotiating field definitions.",
    },
    {
      id: "gro-3",
      title: "Strengthen leadership structure",
      category: "Governance",
      description:
        "Clarify ED–COO–program leads roles as the organization scales past 40 staff.",
      progress: 65,
      status: "On Track",
      owner: "Board chair + ED",
      nextMilestone: "Updated RACI for senior team",
      dueDate: "May 22, 2026",
      lastUpdated: "Apr 1, 2026",
      notes: "Executive session scheduled; compensation committee engaged on retention.",
    },
    {
      id: "gro-4",
      title: "Increase donor retention",
      category: "Sustainability",
      description:
        "Improve stewardship journeys so multi-year donors renew at higher rates.",
      progress: 50,
      status: "On Track",
      owner: "Development director",
      nextMilestone: "Renewal touchpoint calendar live",
      dueDate: "Apr 30, 2026",
      lastUpdated: "Mar 29, 2026",
      notes: "Segmentation pilot shows lift in lapsed reactivation.",
    },
  ],
  keyMetrics: [
    { label: "Active programs", value: "12", sublabel: "Across three pillars", tone: "neutral" },
    { label: "Staff count", value: "42", sublabel: "FTE", tone: "neutral" },
    { label: "Annual budget utilization", value: "78%", sublabel: "YTD", tone: "attention" },
    { label: "Board attendance", value: "92%", sublabel: "YTD", tone: "positive" },
    { label: "Open action items", value: "11", sublabel: "Board + committees", tone: "attention" },
  ],
  risks: [
    { category: "Governance", status: "Medium", summary: "Rapid growth tests decision clarity between board and management.", trend: "stable" },
    { category: "Financial", status: "Medium", summary: "Multi-site costs and grant timing create quarterly pressure.", watchlist: true, trend: "stable" },
    { category: "Compliance", status: "Medium", summary: "Cross-program data agreements need legal review.", trend: "stable" },
    { category: "HR / staffing", status: "Medium", summary: "Hiring and retention pressure as programs expand.", trend: "rising" },
    { category: "Reputational", status: "Low", summary: "Strong regional reputation; proactive stakeholder comms.", trend: "stable" },
  ],
  boardAgenda: {
    nextMeetingDate: "Thursday, May 8, 2026 — 5:30 p.m.",
    meetingLabel: "Regular board meeting",
    items: [
      { title: "Review program expansion strategy", kind: "discussion" },
      { title: "Approve new budget adjustments", kind: "approval" },
      { title: "Discuss leadership structure changes", kind: "decision" },
      { title: "Evaluate fundraising performance", kind: "discussion" },
    ],
  },
  executiveUpdate: {
    wins: ["Launched two new programs in workforce and community health."],
    blockers: ["Reporting inconsistencies across teams slowing leadership reviews."],
    boardNotes: ["Need alignment across departments before Q3 commitments."],
    changesSinceLastMeeting: ["Hired director of data and evaluation.", "Completed external HR policy review."],
    priorityIssues: ["Choose reporting platform path before July board retreat."],
  },
  strategicAlignmentNotes:
    "Priorities balance service growth with the systems and leadership maturity required to sustain it.",
};