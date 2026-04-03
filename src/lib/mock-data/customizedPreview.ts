import type { OrganizationProfile } from "./types";
import { growingBoardMeetings } from "./board-meetings/growing";
import { growingMeetingMinutes } from "./minutes/growing";
import { growingBoardTraining } from "./training/growing";
import { growingBoardVotes } from "./votes/growing";

/**
 * CUSTOMIZED PREVIEW PROFILE — replace with a real prospect snapshot for sales demos.
 * Adjust theme.accent to echo the client brand without implying endorsement.
 */
export const customizedPreview: OrganizationProfile = {
  organizationName: "Riverside Youth & Family Services",
  missionSnippet:
    "We help young people and families build stability through mentoring, counseling, and community supports.",
  logo: { type: "url", src: "/govflow-logo.png", alt: "Non-Profit Flow" },
  reportingPeriod: "Spring 2026 (through April 15)",
  boardChair: "Dr. Amara Okonkwo",
  executiveDirector: "Chris Mendez",
  theme: {
    accent: "#4a5d4a",
    accentForeground: "#f7faf7",
    sidebarBg: "#eef2ec",
    border: "#d6ddd4",
  },
  strategicPriorities: [
    {
      id: "1",
      title: "Youth mentoring expansion",
      category: "Programs",
      description:
        "County partnership expanded hours; volunteer training backlog is clearing. Waitlist is down quarter over quarter.",
      progress: 72,
      status: "On Track",
      owner: "Program director",
      nextMilestone: "Partner MOUs fully executed",
      dueDate: "Apr 20, 2026",
      lastUpdated: "Apr 3, 2026",
      notes: "County liaison confirmed timeline; marketing push for mentors starts next week.",
      alignmentNote: "Aligns with county youth master plan priorities.",
    },
    {
      id: "2",
      title: "Clinical capacity & supervision",
      category: "Quality",
      description:
        "Caseload growth has outpaced hiring; interim coverage is in place. The board may need to weigh investment tradeoffs.",
      progress: 48,
      status: "At Risk",
      owner: "Clinical leadership",
      nextMilestone: "Board-ready options memo on supervision model",
      dueDate: "May 3, 2026",
      lastUpdated: "Mar 29, 2026",
      notes: "Two recruitment offers outstanding; locum coverage extended through mid-May.",
    },
    {
      id: "3",
      title: "Facility readiness (new counseling suite)",
      category: "Operations",
      description:
        "Permit delay is resolved, but the contractor schedule is compressed. Contingency funds are in use within board-approved limits.",
      progress: 33,
      status: "Off Track",
      owner: "Operations + finance",
      nextMilestone: "Construction milestone 2 sign-off",
      dueDate: "Apr 28, 2026",
      lastUpdated: "Mar 25, 2026",
      notes: "Weather and supply issues added two weeks; ED and chair briefed on mitigation options.",
    },
    {
      id: "4",
      title: "Sustainable revenue mix",
      category: "Sustainability",
      description:
        "County contract renewal looks likely; private grants pipeline includes two new family foundations.",
      progress: 61,
      status: "On Track",
      owner: "Development",
      nextMilestone: "County contract renewal briefing to board",
      dueDate: "Apr 17, 2026",
      lastUpdated: "Apr 1, 2026",
      notes: "Development committee aligned on messaging for renewal conversation.",
    },
  ],
  boardAgenda: {
    nextMeetingDate: "Tuesday, April 29, 2026 — 6:00 p.m.",
    meetingLabel: "Regular board meeting",
    items: [
      { title: "Approve construction change order (within delegated limit)", kind: "approval" },
      { title: "Clinical capacity plan — options and timeline", kind: "decision" },
      { title: "County contract renewal — risks and mitigations", kind: "discussion" },
      { title: "ED performance framework — mid-year check-in", kind: "discussion" },
      { title: "Safety & incident reporting (briefing only)", kind: "general" },
    ],
  },
  keyMetrics: [
    { label: "Youth served (YTD)", value: "1,842", sublabel: "vs 1,650 plan", trend: "up", tone: "positive" },
    { label: "Board attendance", value: "89%", sublabel: "Target: 85%", trend: "flat", tone: "neutral" },
    { label: "Fundraising (YTD)", value: "76%", sublabel: "Plan: $2.4M", trend: "down", tone: "attention" },
    { label: "Staff turnover", value: "11%", sublabel: "Sector avg ~18%", trend: "up", tone: "positive" },
    { label: "Open board actions", value: "7", sublabel: "3 overdue", tone: "attention" },
  ],
  risks: [
    { category: "Governance", status: "Medium", summary: "Capacity decision requires clear board guidance on risk tolerance.", owner: "Board Chair", watchlist: true, trend: "rising" },
    { category: "Financial", status: "Medium", summary: "Grant timing and construction cash draws create short-term pressure.", owner: "Treasurer", watchlist: true, trend: "stable" },
    { category: "Compliance", status: "Low", summary: "HIPAA training current; incident protocols reviewed Q1.", trend: "stable" },
    { category: "HR / staffing", status: "High", summary: "Clinical hiring lag is the primary operational constraint.", owner: "ED", watchlist: true, trend: "rising" },
    { category: "Reputational", status: "Low", summary: "Strong community relationships; proactive family communication plan in place.", trend: "stable" },
  ],
  executiveUpdate: {
    wins: [
      "County partnership added 120 new mentoring slots.",
      "Family advisory council launched with 14 parent/caregiver members.",
    ],
    blockers: [
      "Licensed clinician hiring remains 2 FTE behind plan despite expanded recruiting.",
    ],
    boardNotes: [
      "Request: read the clinical capacity memo before April 29 — we need a decision on supervision model and budget impact.",
    ],
    changesSinceLastMeeting: [
      "Operations lead transitioned; interim coverage assigned.",
      "Counseling waitlist policy updated and posted.",
    ],
    priorityIssues: [
      "Board clarity on acceptable financial risk for accelerated hiring vs. deferred program growth.",
    ],
  },
  actionItems: [
    { id: "r1", task: "Approve FY26 insurance renewal", owner: "Board", dueDate: "Apr 29, 2026", status: "Scheduled", overdue: false },
    { id: "r2", task: "Confirm audit committee charter edits", owner: "Governance Chair", dueDate: "Apr 5, 2026", status: "Overdue", overdue: true },
    { id: "r3", task: "Review whistleblower policy redlines", owner: "Full board", dueDate: "Apr 29, 2026", status: "Not started", overdue: false },
    { id: "r4", task: "Fundraising event committee roster", owner: "Development Chair", dueDate: "Mar 20, 2026", status: "In progress", overdue: true },
  ],
  governance: [
    { label: "Policy review cycle", status: "In progress", detail: "Whistleblower + document retention in April packet" },
    { label: "Board recruitment", status: "Active", detail: "Seeking clinical/community liaison profile" },
    { label: "Committee updates", status: "Current", detail: "Clinical quality subcommittee forming" },
    { label: "Annual filings", status: "On track", detail: "990 prep kickoff scheduled May" },
    { label: "Board training", status: "86% complete", detail: "HIPAA refresher due for 3 members" },
  ],
  documents: [
    { title: "April 2026 board packet (draft)", type: "Board packet", lastUpdated: "Apr 14, 2026", href: "#", category: "packet" },
    { title: "March 2026 meeting minutes", type: "Minutes", lastUpdated: "Apr 4, 2026", href: "#", category: "minutes" },
    { title: "Resolution: delegated signing authority (interim)", type: "Resolution", lastUpdated: "Mar 22, 2026", href: "#", category: "resolution" },
    { title: "Upcoming approval: clinical supervision contract", type: "Approval", lastUpdated: "Apr 9, 2026", href: "#", category: "approval" },
  ],
  boardVotes: growingBoardVotes,
  boardTraining: growingBoardTraining,
  meetingMinutes: growingMeetingMinutes,
  boardMeetings: growingBoardMeetings,
  meetingPrepNotes:
    "Please review the clinical capacity options memo (pages 8–11). Come prepared to choose between phased hiring vs. contracted supervision.",
  governanceNotes:
    "Governance committee will propose a board skills matrix update for June, aligned with recruitment priorities.",
  strategicAlignmentNotes:
    "Priorities reflect the board-approved strategic focus: access (mentoring), quality (clinical), and sustainability (revenue + facilities).",
  complianceCalendar: [
    { label: "HIPAA training deadline (remaining board)", date: "Apr 30, 2026", status: "In progress" },
    { label: "Charitable solicitation registration", date: "May 15, 2026", status: "On track" },
    { label: "OSHA walkthrough (facilities)", date: "Jun 4, 2026", status: "Scheduled" },
  ],
};