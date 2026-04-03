import type { OrganizationProfile } from "../types";
import { privateSchoolBoardMeetings } from "../board-meetings/privateSchool";
import { privateSchoolMeetingMinutes } from "../minutes/privateSchool";
import { privateSchoolBoardTraining } from "../training/privateSchool";
import { privateSchoolBoardVotes } from "../votes/privateSchool";
import { genericSample } from "../genericSample";

/** Private school / faith-based — deep navy accent. */
export const privateSchoolProfile: OrganizationProfile = {
  ...genericSample,
  organizationName: "St. Mark's Academy",
  missionSnippet:
    "Providing faith-based education focused on academic excellence and character development.",
  theme: {
    accent: "#1c2d4a",
    accentForeground: "#f4f6fa",
    sidebarBg: "#e8ecf2",
    border: "#cfd6e2",
  },
  reportingPeriod: "2025–26 school year (through April)",
  boardChair: "Rebecca Thompson",
  executiveDirector: "Fr. Michael Brennan",
  strategicPriorities: [
    {
      id: "sch-1",
      title: "Increase student enrollment",
      category: "Growth",
      description:
        "Reach sustainable enrollment targets while preserving class size and formation quality.",
      progress: 60,
      status: "On Track",
      owner: "Head of school",
      nextMilestone: "Spring open house results consolidated",
      dueDate: "May 1, 2026",
      lastUpdated: "Apr 3, 2026",
      notes: "Waitlist healthy; focus shifting to middle grades messaging.",
    },
    {
      id: "sch-2",
      title: "Improve facilities and campus upgrades",
      category: "Campus",
      description:
        "Complete phased upgrades to classrooms, safety systems, and shared learning spaces.",
      progress: 35,
      status: "At Risk",
      owner: "Facilities committee",
      nextMilestone: "Board vote on phase 2 contractor",
      dueDate: "May 20, 2026",
      lastUpdated: "Mar 22, 2026",
      notes: "Permitting slower than planned; finance subcommittee reviewing options.",
    },
    {
      id: "sch-3",
      title: "Strengthen parent engagement",
      category: "Community",
      description:
        "Deepen partnership with families through communication, volunteering, and formation events.",
      progress: 50,
      status: "On Track",
      owner: "Parent association + advancement",
      nextMilestone: "Parent survey action plan adopted",
      dueDate: "Jun 1, 2026",
      lastUpdated: "Mar 31, 2026",
      notes: "Town halls well attended; three working groups formed.",
    },
    {
      id: "sch-4",
      title: "Expand scholarship funding",
      category: "Access",
      description:
        "Grow endowed and annual scholarship dollars so more families can choose St. Mark's.",
      progress: 45,
      status: "On Track",
      owner: "Advancement director",
      nextMilestone: "Scholarship gala goal finalized",
      dueDate: "Apr 25, 2026",
      lastUpdated: "Apr 1, 2026",
      notes: "Lead gift conversation advancing; parish partnership renewed.",
    },
  ],
  keyMetrics: [
    { label: "Student enrollment", value: "420", sublabel: "K–12", tone: "positive" },
    { label: "Staff retention", value: "90%", sublabel: "Rolling 12 months", tone: "positive" },
    { label: "Tuition collection rate", value: "96%", sublabel: "YTD", tone: "positive" },
    { label: "Board attendance", value: "95%", sublabel: "YTD", tone: "positive" },
    { label: "Open action items", value: "4", sublabel: "Board + committees", tone: "neutral" },
  ],
  risks: [
    { category: "Governance", status: "Low", summary: "Board committees active; policies current.", trend: "stable" },
    { category: "Financial", status: "Medium", summary: "Tuition dependency; aid demand rising with enrollment growth.", watchlist: true, trend: "stable" },
    {
      category: "Compliance",
      status: "High",
      summary: "Evolving state reporting rules and safety drills need documented board oversight this cycle.",
      watchlist: true,
      trend: "rising",
    },
    { category: "HR / staffing", status: "Low", summary: "Faculty hiring on track for fall needs.", trend: "stable" },
    { category: "Reputational", status: "Medium", summary: "Competitive market; narrative must stay clear on mission and outcomes.", trend: "stable" },
  ],
  boardAgenda: {
    nextMeetingDate: "Monday, May 5, 2026 — 7:00 p.m.",
    meetingLabel: "Regular board meeting",
    items: [
      { title: "Review enrollment trends", kind: "discussion" },
      { title: "Approve facility upgrade plan", kind: "approval" },
      { title: "Discuss scholarship funding strategy", kind: "decision" },
      { title: "Evaluate parent engagement initiatives", kind: "discussion" },
    ],
  },
  executiveUpdate: {
    wins: ["Enrollment increased by about 8% year over year."],
    blockers: ["Delays in facility planning and bidding timeline."],
    boardNotes: ["Focus on long-term sustainability of tuition and aid model."],
    changesSinceLastMeeting: ["Published new family handbook.", "Completed fall admissions training for ambassadors."],
    priorityIssues: ["Board decision needed on phasing of capital work vs. operating margin."],
  },
  strategicAlignmentNotes:
    "Priorities support accessible Catholic education without compromising academic rigor or community life.",
  boardVotes: privateSchoolBoardVotes,
  boardTraining: privateSchoolBoardTraining,
  meetingMinutes: privateSchoolMeetingMinutes,
  boardMeetings: privateSchoolBoardMeetings,
};