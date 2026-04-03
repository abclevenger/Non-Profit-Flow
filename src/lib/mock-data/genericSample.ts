import type { OrganizationProfile } from "./types";
import { communityBoardMeetings } from "./board-meetings/community";
import { communityMeetingMinutes } from "./minutes/community";
import { communityBoardTraining } from "./training/community";
import { communityBoardVotes } from "./votes/community";

/**
 * GENERIC SAMPLE PROFILE — edit this file for a neutral demo, or duplicate the pattern
 * for a new file like riversidePreview.ts and import it in dashboardData.ts.
 */
export const genericSample: OrganizationProfile = {
  organizationName: "Sample Community Alliance",
  missionSnippet:
    "We strengthen neighborhoods through programs, partnerships, and advocacy so every family can thrive.",
  logo: { type: "url", src: "/govflow-logo.png", alt: "Non-Profit Flow" },
  reportingPeriod: "Q1 2026 (through March 31)",
  boardChair: "Jordan Ellis",
  executiveDirector: "Sam Rivera",
  theme: {
    accent: "#6b5344",
    accentForeground: "#faf8f5",
    sidebarBg: "#f2efe8",
    border: "#e4dfd4",
  },
  strategicPriorities: [
    {
      id: "1",
      title: "Expand community programs",
      category: "Impact",
      description:
        "Three pilot sites are active; early outcomes align with our theory of change. The next focus is sustainable staffing and volunteer coordination.",
      progress: 65,
      status: "On Track",
      owner: "Programs Committee",
      nextMilestone: "Pilot wrap-up report ready for board review",
      dueDate: "Apr 18, 2026",
      lastUpdated: "Apr 2, 2026",
      notes: "Enrollment is ahead of plan in two neighborhoods; a hiring plan for program leads is drafted for committee review.",
      alignmentNote: "Supports mission pillar: direct community impact.",
    },
    {
      id: "2",
      title: "Board recruitment & onboarding",
      category: "Governance",
      description:
        "Two open seats; pipeline conversations are underway. Onboarding materials need a refresh so new members can contribute quickly.",
      progress: 40,
      status: "At Risk",
      owner: "Governance Committee",
      nextMilestone: "Slated candidates confirmed for chair review",
      dueDate: "May 1, 2026",
      lastUpdated: "Mar 28, 2026",
      notes: "Three prospects in conversation; timing is tight before summer meeting cycle.",
    },
    {
      id: "3",
      title: "Strategic plan refresh",
      category: "Strategy",
      description:
        "External scan is complete; staff and board input sessions are scheduled. The draft timeline targets June adoption.",
      progress: 85,
      status: "On Track",
      owner: "Executive director + board chair",
      nextMilestone: "Draft outline circulated in April board packet",
      dueDate: "Apr 22, 2026",
      lastUpdated: "Apr 1, 2026",
      notes: "Feedback themes are being synthesized; finance and programs both engaged.",
    },
    {
      id: "4",
      title: "Fundraising diversification",
      category: "Sustainability",
      description:
        "Renewed focus on recurring giving and two anchor events. Grant pipeline is stable year over year.",
      progress: 52,
      status: "On Track",
      owner: "Development Committee",
      nextMilestone: "Case for support version 1 for board preview",
      dueDate: "May 5, 2026",
      lastUpdated: "Mar 30, 2026",
      notes: "Spring event registration opened; corporate pipeline has two warm leads.",
    },
  ],
  boardAgenda: {
    nextMeetingDate: "Thursday, April 24, 2026 — 5:30 p.m.",
    meetingLabel: "Regular board meeting",
    items: [
      { title: "Approve Q2 operating budget adjustment", kind: "approval" },
      { title: "Review executive director goals (mid-year)", kind: "decision" },
      { title: "Governance policy updates — conflicts & whistleblower", kind: "discussion" },
      { title: "Strategic plan refresh — feedback on draft outline", kind: "discussion" },
      { title: "Committee reports (Programs, Finance, Development)", kind: "general" },
    ],
  },
  keyMetrics: [
    { label: "Board attendance (YTD)", value: "92%", sublabel: "Target: 85%", trend: "up", tone: "positive" },
    { label: "Active programs", value: "12", sublabel: "3 pilots", tone: "neutral" },
    { label: "Fundraising (YTD vs plan)", value: "88%", sublabel: "Plan: $1.2M", trend: "flat", tone: "attention" },
    { label: "Staff retention", value: "94%", sublabel: "Rolling 12 months", trend: "up", tone: "positive" },
    { label: "Open board actions", value: "5", sublabel: "2 due before next meeting", tone: "neutral" },
  ],
  risks: [
    { category: "Governance", status: "Low", summary: "Policies current; recruitment pacing is the main watch area.", owner: "Governance Committee", trend: "stable" },
    { category: "Financial", status: "Medium", summary: "Q2 cash flow tight if a major grant payment shifts; finance team monitoring weekly.", owner: "Finance Committee", watchlist: true, trend: "stable" },
    { category: "Compliance", status: "Medium", summary: "Upcoming contract renewals require legal review on data use.", owner: "ED + Counsel", trend: "stable" },
    { category: "HR / staffing", status: "Low", summary: "Key roles filled; backfill plan exists for program lead.", trend: "improving" },
    { category: "Reputational", status: "Low", summary: "No active issues; community listening sessions continuing.", trend: "stable" },
  ],
  executiveUpdate: {
    wins: [
      "Pilot programs exceeded enrollment targets in two neighborhoods.",
      "New corporate partner committed to three-year sponsorship.",
    ],
    blockers: [
      "Facilities vendor delays pushed one program start by ~3 weeks.",
    ],
    boardNotes: [
      "Please review the draft budget memo before the meeting — focus questions welcome on reserves policy.",
    ],
    changesSinceLastMeeting: [
      "Hired interim grants manager; permanent search opens in May.",
      "Updated vendor agreement template with counsel.",
    ],
    priorityIssues: [
      "Clarify board role in advocacy activities for the strategic plan.",
    ],
  },
  actionItems: [
    { id: "a1", task: "Approve revised reserve policy (first read)", owner: "Board", dueDate: "Apr 24, 2026", status: "Scheduled", overdue: false, linkedMeetingId: "meet-community-may2026", linkedVoteId: "cv-1" },
    { id: "a2", task: "Confirm audit timeline with firm", owner: "Finance Chair", dueDate: "Apr 10, 2026", status: "In progress", overdue: false },
    { id: "a3", task: "Finalize ED evaluation process calendar", owner: "Governance Chair", dueDate: "Mar 28, 2026", status: "In progress", overdue: true },
    { id: "a4", task: "Review updated whistleblower policy", owner: "Full board", dueDate: "Apr 24, 2026", status: "Not started", overdue: false },
  ],
  governance: [
    { label: "Policy review cycle", status: "On schedule", detail: "Next bundle: Apr board packet" },
    { label: "Board recruitment", status: "In progress", detail: "2 open seats; 4 conversations" },
    { label: "Committee charters", status: "Current", detail: "Annual review complete" },
    { label: "Annual filings (990 / state)", status: "On track", detail: "990 filing target: Aug 15" },
    { label: "Board training (orientation + ethics)", status: "92% complete", detail: "2 members finishing module by Apr 30" },
  ],
  documents: [
    {
      title: "April 2026 board packet (draft)",
      type: "Board packet",
      lastUpdated: "Apr 12, 2026",
      href: "#",
      category: "packet",
      downloadAllowed: false,
    },
    { title: "March 2026 meeting minutes", type: "Minutes", lastUpdated: "Apr 2, 2026", href: "#", category: "minutes" },
    { title: "Resolution: FY26 signing authority", type: "Resolution", lastUpdated: "Mar 18, 2026", href: "#", category: "resolution" },
    { title: "Upcoming approval: facilities MOU", type: "Approval", lastUpdated: "Apr 8, 2026", href: "#", category: "approval" },
  ],
  boardVotes: communityBoardVotes,
  boardTraining: communityBoardTraining,
  meetingMinutes: communityMeetingMinutes,
  boardMeetings: communityBoardMeetings,
  meetingPrepNotes:
    "Board members: please skim the strategic plan outline (Section 3) and note two questions for discussion. Finance — reserves memo is pages 4–6.",
  governanceNotes:
    "Governance committee recommends a short board education segment on conflicts of interest at the June meeting.",
  strategicAlignmentNotes:
    "Priorities map to the 2024–2027 strategic framework: impact (programs), sustainability (fundraising), and stewardship (governance).",
  complianceCalendar: [
    { label: "990 filing window opens", date: "May 1, 2026", status: "Planned" },
    { label: "Charitable registration renewal", date: "Jun 30, 2026", status: "On track" },
    { label: "Workers comp audit", date: "Jul 15, 2026", status: "Vendor scheduled" },
  ],
};