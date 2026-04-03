import type { MeetingMinutesRecord } from "../types";

/** Minutes mock data — growing multi-program nonprofit. */
export const growingMeetingMinutes: MeetingMinutesRecord[] = [
  {
    "id": "mm-g-1",
    "meetingId": "meet-growing-q1-mar",
    "meetingTitle": "Q1 2026 Quarterly Board Strategy Meeting",
    "meetingDate": "Mar 20, 2026",
    "meetingType": "Regular",
    "status": "Approved",
    "summary": "Board aligned on program expansion guardrails and reporting dashboard timeline.",
    "attendees": [
      "Elena Morales (Chair)",
      "James Okoro",
      "Full board"
    ],
    "discussionNotes": "Data definitions still contested; board asked for single prototype by June.",
    "decisionsMade": [
      {
        "id": "d-g-1",
        "title": "Expansion guardrails",
        "summary": "Cap new sites until reporting prototype approved.",
        "outcome": "Approved"
      },
      {
        "id": "d-g-2",
        "title": "Executive session summary",
        "summary": "Personnel matter \u2014 no public detail recorded.",
        "outcome": "Noted"
      }
    ],
    "linkedVotes": [
      "vote-g-expansion"
    ],
    "linkedAgendaItems": [
      "Program expansion",
      "Reporting roadmap"
    ],
    "followUpActions": [
      {
        "id": "fu-g-1",
        "task": "Deliver dashboard prototype to board chair",
        "owner": "Chief of Staff",
        "dueDate": "May 15, 2026",
        "status": "Open"
      },
      {
        "id": "fu-g-2",
        "task": "Schedule cross-program data owners workshop",
        "owner": "COO",
        "dueDate": "Apr 30, 2026",
        "status": "Open"
      }
    ],
    "preparedBy": "Corporate secretary",
    "approvedDate": "Apr 1, 2026",
    "publicVisible": false,
    "linkedDocuments": [
      {
        "id": "doc-g-1",
        "title": "Q1 strategy minutes (internal)",
        "href": "#"
      }
    ],
    "createdAt": "Mar 22, 2026",
    "updatedAt": "Apr 1, 2026",
    "draftCreatedAt": "Mar 22, 2026",
    "sentForReviewAt": "Mar 25, 2026"
  },
  {
    "id": "mm-g-2",
    "meetingId": "meet-growing-exp-feb",
    "meetingTitle": "Program Expansion Oversight Meeting",
    "meetingDate": "Feb 5, 2026",
    "meetingType": "Special",
    "status": "In Review",
    "summary": "Deep dive on workforce cohort capacity and employer partner pipeline.",
    "attendees": [
      "Board chair",
      "ED",
      "Workforce VP",
      "Finance chair"
    ],
    "discussionNotes": "Draft circulated to committee; accuracy check in progress.",
    "decisionsMade": [
      {
        "id": "d-g-3",
        "title": "Employer advisory group",
        "summary": "Charter to be finalized after legal review.",
        "outcome": "Pending"
      }
    ],
    "linkedVotes": [],
    "linkedAgendaItems": [
      "Employer MOUs",
      "Cohort capacity"
    ],
    "followUpActions": [
      {
        "id": "fu-g-3",
        "task": "Legal review advisory group charter",
        "owner": "General counsel",
        "dueDate": "Mar 10, 2026",
        "status": "Open"
      }
    ],
    "preparedBy": "Committee admin",
    "publicVisible": false,
    "linkedDocuments": [],
    "createdAt": "Feb 7, 2026",
    "updatedAt": "Feb 12, 2026",
    "draftCreatedAt": "Feb 7, 2026",
    "sentForReviewAt": "Feb 10, 2026"
  },
  {
    "id": "mm-g-3",
    "meetingId": "meet-growing-gov-jan",
    "meetingTitle": "Governance and Compliance Review",
    "meetingDate": "Jan 15, 2026",
    "meetingType": "Committee",
    "status": "Published",
    "summary": "Annual governance checklist; whistleblower policy timeline confirmed.",
    "publicSummary": "Board committee completed annual governance review; policy updates on schedule.",
    "attendees": [
      "Governance committee",
      "Compliance lead"
    ],
    "discussionNotes": "No objections to April packet bundle plan.",
    "decisionsMade": [
      {
        "id": "d-g-4",
        "title": "Policy bundle timeline",
        "summary": "Whistleblower + retention in April packet.",
        "outcome": "Confirmed"
      }
    ],
    "linkedVotes": [],
    "linkedAgendaItems": [
      "Compliance calendar"
    ],
    "followUpActions": [
      {
        "id": "fu-g-4",
        "task": "Post public governance summary",
        "owner": "Communications",
        "dueDate": "Jan 25, 2026",
        "status": "Done"
      }
    ],
    "preparedBy": "Governance chair",
    "approvedDate": "Jan 22, 2026",
    "publishedDate": "Jan 24, 2026",
    "publicVisible": true,
    "linkedDocuments": [
      {
        "id": "doc-g-2",
        "title": "Public governance summary",
        "href": "#"
      }
    ],
    "createdAt": "Jan 17, 2026",
    "updatedAt": "Jan 24, 2026",
    "draftCreatedAt": "Jan 17, 2026",
    "sentForReviewAt": "Jan 18, 2026"
  },
  {
    "id": "mm-g-4",
    "meetingId": "meet-growing-finance-draft",
    "meetingTitle": "Finance Committee (Draft)",
    "meetingDate": "Apr 3, 2026",
    "meetingType": "Committee",
    "status": "Draft",
    "summary": "Preliminary cash forecast notes \u2014 not yet circulated to full board.",
    "attendees": [
      "Treasurer",
      "Finance manager"
    ],
    "discussionNotes": "Internal working session.",
    "decisionsMade": [],
    "linkedVotes": [],
    "linkedAgendaItems": [
      "Q2 cash"
    ],
    "followUpActions": [
      {
        "id": "fu-g-5",
        "task": "Integrate forecast into April board packet",
        "owner": "Treasurer",
        "dueDate": "Apr 12, 2026",
        "status": "Open"
      }
    ],
    "preparedBy": "Treasurer",
    "publicVisible": false,
    "linkedDocuments": [],
    "createdAt": "Apr 4, 2026",
    "updatedAt": "Apr 4, 2026",
    "draftCreatedAt": "Apr 4, 2026"
  }
];
