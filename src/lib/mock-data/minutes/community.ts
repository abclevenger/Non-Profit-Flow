import type { MeetingMinutesRecord } from "../types";

/** Minutes mock data — small community nonprofit. */
export const communityMeetingMinutes: MeetingMinutesRecord[] = [
  {
    "id": "mm-c-1",
    "meetingId": "meet-community-mar2026",
    "meetingTitle": "March 2026 Regular Board Meeting",
    "meetingDate": "Mar 4, 2026",
    "meetingType": "Regular",
    "status": "Approved",
    "summary": "Board reviewed program updates, approved revised volunteer onboarding checklist, and received finance Q1 snapshot.",
    "publicSummary": "The board approved volunteer policy updates and received reports on programs and finances.",
    "attendees": [
      "Maria Santos (Chair)",
      "David Chen (ED)",
      "J. Ellis",
      "T. Nguyen",
      "R. Patel",
      "K. Washington"
    ],
    "discussionNotes": "Programs reported strong pantry partnerships; finance noted grant payment timing watch.",
    "decisionsMade": [
      {
        "id": "d-c-1",
        "title": "Volunteer onboarding checklist",
        "summary": "Adopt revised checklist aligned with background check vendor.",
        "outcome": "Approved unanimously"
      },
      {
        "id": "d-c-2",
        "title": "March consent agenda",
        "summary": "Prior meeting minutes and routine filings.",
        "outcome": "Approved"
      }
    ],
    "linkedVotes": [],
    "linkedAgendaItems": [
      "Volunteer program update",
      "Finance Q1 snapshot",
      "Consent agenda"
    ],
    "followUpActions": [
      {
        "id": "fu-c-1",
        "task": "Circulate signed conflict disclosures",
        "owner": "Governance Chair",
        "dueDate": "Mar 20, 2026",
        "status": "Open"
      },
      {
        "id": "fu-c-2",
        "task": "Post approved volunteer checklist to shared drive",
        "owner": "ED office",
        "dueDate": "Mar 15, 2026",
        "status": "Done"
      }
    ],
    "preparedBy": "Board secretary",
    "approvedDate": "Mar 18, 2026",
    "publicVisible": true,
    "linkedDocuments": [
      {
        "id": "doc-c-1",
        "title": "March 2026 approved minutes (PDF)",
        "href": "#"
      }
    ],
    "createdAt": "Mar 5, 2026",
    "updatedAt": "Mar 18, 2026",
    "draftCreatedAt": "Mar 5, 2026",
    "sentForReviewAt": "Mar 10, 2026"
  },
  {
    "id": "mm-c-2",
    "meetingId": "meet-community-feb2026",
    "meetingTitle": "Volunteer Program Review (Special Meeting)",
    "meetingDate": "Feb 12, 2026",
    "meetingType": "Special",
    "status": "In Review",
    "summary": "Focused session on Saturday route coverage, training gaps, and recognition plan.",
    "attendees": [
      "Maria Santos",
      "David Chen",
      "Volunteer Manager",
      "Programs lead"
    ],
    "discussionNotes": "Recommendations to come to full board in May.",
    "decisionsMade": [
      {
        "id": "d-c-3",
        "title": "Pilot recognition mini-grants",
        "summary": "Try small stipends for lead drivers Q2.",
        "outcome": "Recommended to full board"
      }
    ],
    "linkedVotes": [],
    "linkedAgendaItems": [
      "Route coverage",
      "Training backlog"
    ],
    "followUpActions": [
      {
        "id": "fu-c-3",
        "task": "Draft recognition pilot budget line",
        "owner": "Finance Chair",
        "dueDate": "Apr 1, 2026",
        "status": "Open"
      },
      {
        "id": "fu-c-4",
        "task": "Confirm legal review of stipend approach",
        "owner": "ED",
        "dueDate": "Apr 8, 2026",
        "status": "Open"
      }
    ],
    "preparedBy": "Committee recorder",
    "publicVisible": false,
    "linkedDocuments": [],
    "createdAt": "Feb 14, 2026",
    "updatedAt": "Feb 20, 2026",
    "draftCreatedAt": "Feb 14, 2026",
    "sentForReviewAt": "Feb 18, 2026"
  },
  {
    "id": "mm-c-3",
    "meetingId": "meet-community-jun2025",
    "meetingTitle": "Annual Budget Approval Meeting",
    "meetingDate": "Jun 18, 2025",
    "meetingType": "Regular",
    "status": "Published",
    "summary": "Adopted FY26 operating budget and reserves policy first read outcomes.",
    "publicSummary": "FY26 budget adopted; reserves policy advanced to final read.",
    "attendees": [
      "Full board (9)",
      "David Chen",
      "Treasurer",
      "Finance manager"
    ],
    "discussionNotes": "Discussion centered on scenario planning for grant delays.",
    "decisionsMade": [
      {
        "id": "d-c-4",
        "title": "FY26 operating budget",
        "summary": "Adopted as presented with one amendment.",
        "outcome": "Approved 8-1"
      },
      {
        "id": "d-c-5",
        "title": "Reserves policy (first read)",
        "summary": "Accepted first read; final vote scheduled July.",
        "outcome": "First read approved"
      }
    ],
    "linkedVotes": [],
    "linkedAgendaItems": [
      "FY26 budget",
      "Reserves policy"
    ],
    "followUpActions": [
      {
        "id": "fu-c-5",
        "task": "Publish budget summary for community newsletter",
        "owner": "Communications",
        "dueDate": "Jul 1, 2025",
        "status": "Done"
      }
    ],
    "preparedBy": "Treasurer",
    "approvedDate": "Jul 2, 2025",
    "publishedDate": "Jul 8, 2025",
    "publicVisible": true,
    "linkedDocuments": [
      {
        "id": "doc-c-2",
        "title": "FY26 budget summary (public)",
        "href": "#"
      }
    ],
    "createdAt": "Jun 20, 2025",
    "updatedAt": "Jul 8, 2025",
    "draftCreatedAt": "Jun 20, 2025",
    "sentForReviewAt": "Jun 24, 2025"
  },
  {
    "id": "mm-c-4",
    "meetingId": "meet-community-gov-apr",
    "meetingTitle": "Governance Committee (Draft notes)",
    "meetingDate": "Apr 1, 2026",
    "meetingType": "Committee",
    "status": "Draft",
    "summary": "Working notes on candidate interviews and onboarding packet refresh.",
    "attendees": [
      "Governance Chair",
      "2 committee members"
    ],
    "discussionNotes": "Internal only until full packet shared.",
    "decisionsMade": [],
    "linkedVotes": [],
    "linkedAgendaItems": [
      "Recruitment pipeline"
    ],
    "followUpActions": [
      {
        "id": "fu-c-6",
        "task": "Finalize slate memo for May board",
        "owner": "Governance Chair",
        "dueDate": "Apr 22, 2026",
        "status": "Open"
      }
    ],
    "preparedBy": "Governance Chair",
    "publicVisible": false,
    "linkedDocuments": [],
    "createdAt": "Apr 2, 2026",
    "updatedAt": "Apr 2, 2026",
    "draftCreatedAt": "Apr 2, 2026"
  }
];
