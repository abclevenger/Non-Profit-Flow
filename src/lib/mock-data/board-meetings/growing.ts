import type { BoardMeeting } from "../types";

/** Unified board meetings — growing multi-program profile */
export const growingBoardMeetings: BoardMeeting[] = [
  {
    "id": "meet-growing-may2026",
    "title": "May 2026 Regular Board Meeting",
    "meetingDate": "Thursday, May 8, 2026 \u2014 5:30 p.m.",
    "dateKey": "2026-05-08",
    "meetingType": "Board",
    "status": "Scheduled",
    "agendaItems": [
      {
        "id": "wag-1",
        "title": "Operating budget \u2014 program expansion",
        "informational": false,
        "linkedVoteId": "gr-1"
      },
      {
        "id": "wag-2",
        "title": "Leadership restructure proposal",
        "informational": false,
        "linkedVoteId": "gr-2"
      },
      {
        "id": "wag-3",
        "title": "Grant compliance policy (if ready)",
        "informational": false,
        "linkedVoteId": "gr-3"
      },
      {
        "id": "wag-4",
        "title": "Development staffing follow-up",
        "informational": false,
        "linkedVoteId": "gr-7"
      },
      {
        "id": "wag-5",
        "title": "Committee reports",
        "informational": true
      }
    ],
    "voteItems": [
      "gr-1",
      "gr-2",
      "gr-3",
      "gr-7"
    ],
    "minutesRecordId": null,
    "actionItems": [],
    "publicVisible": false,
    "preMeetingDiscussionVoteIds": [
      "gr-1",
      "gr-2"
    ]
  },
  {
    "id": "meet-growing-q1-mar",
    "title": "Q1 2026 Quarterly Board Strategy Meeting",
    "meetingDate": "Thursday, Mar 20, 2026 \u2014 5:30 p.m.",
    "dateKey": "2026-03-20",
    "meetingType": "Board",
    "status": "Completed",
    "agendaItems": [
      {
        "id": "wag-m1",
        "title": "Strategy & expansion guardrails",
        "informational": true
      }
    ],
    "voteItems": [],
    "minutesRecordId": "mm-g-1",
    "actionItems": [],
    "publicVisible": false,
    "preMeetingDiscussionVoteIds": []
  },
  {
    "id": "meet-growing-exp-feb",
    "title": "Program Expansion Oversight Meeting",
    "meetingDate": "Thursday, Feb 5, 2026 \u2014 4:00 p.m.",
    "dateKey": "2026-02-05",
    "meetingType": "Special",
    "status": "Completed",
    "agendaItems": [
      {
        "id": "wag-e1",
        "title": "Cohort capacity deep dive",
        "informational": true
      }
    ],
    "voteItems": [],
    "minutesRecordId": "mm-g-2",
    "actionItems": [],
    "publicVisible": false,
    "preMeetingDiscussionVoteIds": []
  },
  {
    "id": "meet-growing-apr22",
    "title": "April 2026 Board Meeting",
    "meetingDate": "Tuesday, Apr 22, 2026 \u2014 5:30 p.m.",
    "dateKey": "2026-04-22",
    "meetingType": "Board",
    "status": "Completed",
    "agendaItems": [
      {
        "id": "wag-a1",
        "title": "Partnership MOU (county health)",
        "informational": false,
        "linkedVoteId": "gr-4"
      }
    ],
    "voteItems": [
      "gr-4"
    ],
    "minutesRecordId": null,
    "actionItems": [],
    "publicVisible": true,
    "preMeetingDiscussionVoteIds": [
      "gr-4"
    ]
  },
  {
    "id": "meet-growing-gov-jan",
    "title": "Governance and Compliance Review",
    "meetingDate": "Thursday, Jan 15, 2026 \u2014 4:30 p.m.",
    "dateKey": "2026-01-15",
    "meetingType": "Committee",
    "status": "Completed",
    "agendaItems": [
      {
        "id": "wag-g1",
        "title": "Annual governance checklist",
        "informational": true
      }
    ],
    "voteItems": [],
    "minutesRecordId": "mm-g-3",
    "actionItems": [],
    "publicVisible": true,
    "preMeetingDiscussionVoteIds": []
  },
  {
    "id": "meet-growing-capital-mar",
    "title": "March 2026 Board Meeting — Capital plan",
    "meetingDate": "Friday, Mar 28, 2026 — 5:30 p.m.",
    "dateKey": "2026-03-28",
    "meetingType": "Board",
    "status": "Completed",
    "agendaItems": [
      {"id": "wag-c1", "title": "Facilities capital plan (trimmed scope)", "informational": false, "linkedVoteId": "gr-5"}
    ],
    "voteItems": ["gr-5"],
    "minutesRecordId": null,
    "actionItems": [],
    "publicVisible": true,
    "preMeetingDiscussionVoteIds": []
  },
  {
    "id": "meet-growing-apr15",
    "title": "April 2026 Board working session",
    "meetingDate": "Tuesday, Apr 15, 2026 — 5:30 p.m.",
    "dateKey": "2026-04-15",
    "meetingType": "Board",
    "status": "Completed",
    "agendaItems": [
      {"id": "wag-t1", "title": "Data system consolidation (tabled)", "informational": false, "linkedVoteId": "gr-6"}
    ],
    "voteItems": ["gr-6"],
    "minutesRecordId": null,
    "actionItems": [],
    "publicVisible": false,
    "preMeetingDiscussionVoteIds": []
  },
  {
    "id": "meet-growing-finance-draft",
    "title": "Finance Committee (draft notes)",
    "meetingDate": "Thursday, Apr 3, 2026 \u2014 7:30 a.m.",
    "dateKey": "2026-04-03",
    "meetingType": "Committee",
    "status": "Scheduled",
    "agendaItems": [
      {
        "id": "wag-f1",
        "title": "Q2 cash forecast",
        "informational": true
      }
    ],
    "voteItems": [],
    "minutesRecordId": "mm-g-4",
    "actionItems": [],
    "publicVisible": false,
    "preMeetingDiscussionVoteIds": []
  }
];
