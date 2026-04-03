import type { BoardMeeting } from "../types";

/** Unified board meetings â€” Community Outreach / generic community profile */
export const communityBoardMeetings: BoardMeeting[] = [
  {
    "id": "meet-community-may2026",
    "title": "May 2026 Regular Board Meeting",
    "meetingDate": "Tuesday, May 6, 2026 \u2014 6:00 p.m.",
    "dateKey": "2026-05-06",
    "meetingType": "Board",
    "status": "Scheduled",
    "agendaItems": [
      {
        "id": "wac-1",
        "title": "Call to order & consent calendar",
        "informational": true
      },
      {
        "id": "wac-2",
        "title": "Approve new board member candidates (slate vote)",
        "informational": false,
        "linkedVoteId": "cv-1"
      },
      {
        "id": "wac-3",
        "title": "Approve revised volunteer policy",
        "informational": false,
        "linkedVoteId": "cv-2"
      },
      {
        "id": "wac-4",
        "title": "Emergency grant reallocation (if ready)",
        "informational": false,
        "linkedVoteId": "cv-3"
      },
      {
        "id": "wac-5",
        "title": "Grant reporting template follow-up",
        "informational": false,
        "linkedVoteId": "cv-7"
      },
      {
        "id": "wac-6",
        "title": "Committee reports",
        "informational": true
      }
    ],
    "voteItems": [
      "cv-1",
      "cv-2",
      "cv-3",
      "cv-7"
    ],
    "minutesRecordId": null,
    "actionItems": [
      "a1"
    ],
    "publicVisible": true,
    "preMeetingDiscussionVoteIds": [
      "cv-1",
      "cv-2",
      "cv-3"
    ]
  },
  {
    "id": "meet-community-mar2026",
    "title": "March 2026 Regular Board Meeting",
    "meetingDate": "Tuesday, Mar 4, 2026 \u2014 6:00 p.m.",
    "dateKey": "2026-03-04",
    "meetingType": "Board",
    "status": "Completed",
    "agendaItems": [
      {
        "id": "wac-m1",
        "title": "Programs & finance snapshot",
        "informational": true
      },
      {
        "id": "wac-m2",
        "title": "Volunteer policy (prep for May vote)",
        "informational": true
      },
      {
        "id": "wac-m3",
        "title": "Consent agenda",
        "informational": true
      }
    ],
    "voteItems": [],
    "minutesRecordId": "mm-c-1",
    "actionItems": [],
    "publicVisible": true,
    "preMeetingDiscussionVoteIds": []
  },
  {
    "id": "meet-community-feb2026",
    "title": "Volunteer Program Review (Special Meeting)",
    "meetingDate": "Wednesday, Feb 12, 2026 — 5:30 p.m.",
    "dateKey": "2026-02-12",
    "meetingType": "Special",
    "status": "Completed",
    "agendaItems": [
      {"id": "wac-f1", "title": "Route coverage & training", "informational": true},
      {"id": "wac-f2", "title": "Recognition pilot recommendation", "informational": true}
    ],
    "voteItems": [],
    "minutesRecordId": "mm-c-2",
    "actionItems": [],
    "publicVisible": false,
    "preMeetingDiscussionVoteIds": []
  },
  {
    "id": "meet-community-jun2025",
    "title": "Annual Budget Approval Meeting",
    "meetingDate": "Wednesday, Jun 18, 2025 — 6:00 p.m.",
    "dateKey": "2025-06-18",
    "meetingType": "Board",
    "status": "Completed",
    "agendaItems": [
      {"id": "wac-j1", "title": "FY26 budget adoption", "informational": false},
      {"id": "wac-j2", "title": "Reserves policy first read", "informational": false}
    ],
    "voteItems": [],
    "minutesRecordId": "mm-c-3",
    "actionItems": [],
    "publicVisible": true,
    "preMeetingDiscussionVoteIds": []
  },
  {
    "id": "meet-community-apr8",
    "title": "April 2026 Regular Board Meeting",
    "meetingDate": "Tuesday, Apr 8, 2026 \u2014 6:00 p.m.",
    "dateKey": "2026-04-08",
    "meetingType": "Board",
    "status": "Completed",
    "agendaItems": [
      {
        "id": "wac-a1",
        "title": "Office lease extension",
        "informational": false,
        "linkedVoteId": "cv-4"
      },
      {
        "id": "wac-a2",
        "title": "Community room use policy",
        "informational": false,
        "linkedVoteId": "cv-6"
      }
    ],
    "voteItems": [
      "cv-4",
      "cv-6"
    ],
    "minutesRecordId": null,
    "actionItems": [],
    "publicVisible": false,
    "preMeetingDiscussionVoteIds": [
      "cv-4",
      "cv-6"
    ]
  },
  {
    "id": "meet-community-apr15",
    "title": "April 2026 Board Meeting (consent & risk)",
    "meetingDate": "Tuesday, Apr 15, 2026 \u2014 6:00 p.m.",
    "dateKey": "2026-04-15",
    "meetingType": "Board",
    "status": "Completed",
    "agendaItems": [
      {
        "id": "wac-p1",
        "title": "FY26 insurance renewal (consent)",
        "informational": false,
        "linkedVoteId": "cv-5"
      }
    ],
    "voteItems": [
      "cv-5"
    ],
    "minutesRecordId": null,
    "actionItems": [],
    "publicVisible": false,
    "preMeetingDiscussionVoteIds": []
  },
  {
    "id": "meet-community-gov-apr",
    "title": "Governance Committee \u2014 April working session",
    "meetingDate": "Tuesday, Apr 1, 2026 \u2014 5:00 p.m.",
    "dateKey": "2026-04-01",
    "meetingType": "Committee",
    "status": "Scheduled",
    "agendaItems": [
      {
        "id": "wac-g1",
        "title": "Recruitment pipeline & slate prep",
        "informational": true
      }
    ],
    "voteItems": [],
    "minutesRecordId": "mm-c-4",
    "actionItems": [],
    "publicVisible": false,
    "preMeetingDiscussionVoteIds": []
  }
];


