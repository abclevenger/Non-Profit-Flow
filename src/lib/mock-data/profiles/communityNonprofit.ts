import type { OrganizationProfile } from "../types";
import { genericSample } from "../genericSample";

/** Small community nonprofit — soft green accent. */
export const communityNonprofitProfile: OrganizationProfile = {
  ...genericSample,
  organizationName: "Community Outreach Network",
  missionSnippet:
    "Providing local support services and programs to underserved families in the community.",
  theme: {
    accent: "#5a7d6a",
    accentForeground: "#f7faf8",
    sidebarBg: "#eef4f0",
    border: "#d4e0d9",
  },
  reportingPeriod: "Spring 2026 (through April 30)",
  boardChair: "Maria Santos",
  executiveDirector: "David Chen",
  strategicPriorities: [
    {
      id: "con-1",
      title: "Expand food distribution program",
      category: "Programs",
      description:
        "Grow reliable access to healthy meals through pantry partners, mobile sites, and weekend backpack programs.",
      progress: 70,
      status: "On Track",
      owner: "Programs director",
      nextMilestone: "Second mobile distribution site opens",
      dueDate: "May 15, 2026",
      lastUpdated: "Apr 1, 2026",
      notes: "New church partner committed cold storage; volunteer drivers roster up 12%.",
    },
    {
      id: "con-2",
      title: "Recruit new board members",
      category: "Governance",
      description:
        "Fill open seats with skills in finance and community outreach; refresh onboarding so new members contribute quickly.",
      progress: 45,
      status: "At Risk",
      owner: "Governance committee",
      nextMilestone: "Slated candidates ready for board vote",
      dueDate: "Jun 1, 2026",
      lastUpdated: "Mar 28, 2026",
      notes: "Pipeline is active but slower than hoped; two prospects paused due to work travel.",
    },
    {
      id: "con-3",
      title: "Improve volunteer coordination",
      category: "Operations",
      description:
        "Simplify scheduling, training, and recognition so volunteers stay engaged across food and family programs.",
      progress: 60,
      status: "On Track",
      owner: "Volunteer manager",
      nextMilestone: "Roll out shared scheduling tool to all leads",
      dueDate: "May 1, 2026",
      lastUpdated: "Apr 2, 2026",
      notes: "Pilot group cut no-shows by roughly one-fifth; handbook update in review.",
    },
    {
      id: "con-4",
      title: "Diversify grassroots fundraising",
      category: "Sustainability",
      description:
        "Build a stronger small-donor base alongside grants so programs are less dependent on a few large awards.",
      progress: 52,
      status: "On Track",
      owner: "Development committee",
      nextMilestone: "Spring appeal launch",
      dueDate: "Apr 20, 2026",
      lastUpdated: "Mar 30, 2026",
      notes: "Story bank drafted; board ambassadors identified for peer outreach.",
    },
  ],
  keyMetrics: [
    { label: "Active volunteers", value: "48", sublabel: "Food + family programs", tone: "neutral" },
    { label: "Families served (monthly)", value: "320", sublabel: "Across all sites", tone: "positive" },
    { label: "Board attendance", value: "88%", sublabel: "YTD average", tone: "neutral" },
    { label: "Open action items", value: "6", sublabel: "Board + committees", tone: "attention" },
  ],
  risks: [
    { category: "Governance", status: "Medium", summary: "Board gaps and recruitment pacing could slow key decisions.", owner: "Board chair", trend: "stable" },
    { category: "Financial", status: "Medium", summary: "Grant dependency remains high; cash flow sensitive to payment timing.", owner: "Treasurer", watchlist: true, trend: "stable" },
    { category: "Compliance", status: "Low", summary: "Policies current; no open issues.", trend: "stable" },
    { category: "HR / staffing", status: "Low", summary: "Small team stable; cross-training in progress.", trend: "stable" },
    { category: "Reputational", status: "Low", summary: "Strong neighborhood trust.", trend: "stable" },
  ],
  boardAgenda: {
    nextMeetingDate: "Tuesday, May 6, 2026 — 6:00 p.m.",
    meetingLabel: "Regular board meeting",
    items: [
      { title: "Approve new board member candidates", kind: "approval" },
      { title: "Review grant funding status", kind: "decision" },
      { title: "Discuss volunteer program improvements", kind: "discussion" },
      { title: "Committee reports", kind: "general" },
    ],
  },
  executiveUpdate: {
    wins: ["Increased food distribution reach by roughly 20% compared to last quarter."],
    blockers: ["Volunteer scheduling gaps on Saturday mobile routes."],
    boardNotes: ["Focus needed on board recruitment before summer meeting cycle."],
    changesSinceLastMeeting: ["Signed MOU with second pantry partner.", "Hired part-time volunteer coordinator."],
    priorityIssues: ["Confirm whether to prioritize mobile sites vs. pantry hours this fiscal year."],
  },
  strategicAlignmentNotes:
    "Priorities align with serving more families with dignity while building a sustainable volunteer and funding base.",
};