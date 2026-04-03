import type { BoardMeeting } from "../types";

/** Unified board meetings — private school profile */
export const privateSchoolBoardMeetings: BoardMeeting[] = [
  {
    "id": "meet-school-may2026",
    "title": "May 2026 Regular Board of Trustees Meeting",
    "meetingDate": "Monday, May 5, 2026 \u2014 7:00 p.m.",
    "dateKey": "2026-05-05",
    "meetingType": "Board",
    "status": "Scheduled",
    "agendaItems": [
      {
        "id": "was-1",
        "title": "Tuition assistance allocation",
        "informational": false,
        "linkedVoteId": "ps-1"
      },
      {
        "id": "was-2",
        "title": "Facilities upgrade phase one",
        "informational": false,
        "linkedVoteId": "ps-2"
      },
      {
        "id": "was-3",
        "title": "Parent handbook updates",
        "informational": false,
        "linkedVoteId": "ps-3"
      },
      {
        "id": "was-4",
        "title": "School calendar (approved April — informational)",
        "informational": true
      },
      {
        "id": "was-5",
        "title": "Enrollment & advancement",
        "informational": true
      }
    ],
    "voteItems": [
      "ps-1",
      "ps-2",
      "ps-3",
      "ps-7"
    ],
    "minutesRecordId": null,
    "actionItems": [],
    "publicVisible": true,
    "preMeetingDiscussionVoteIds": [
      "ps-1",
      "ps-2"
    ]
  },
  {
    "id": "meet-school-apr2026",
    "title": "April 2026 Board Meeting",
    "meetingDate": "Monday, Apr 14, 2026 — 7:00 p.m.",
    "dateKey": "2026-04-14",
    "meetingType": "Board",
    "status": "Completed",
    "agendaItems": [
      {"id": "was-ap1", "title": "School calendar adjustment", "informational": false, "linkedVoteId": "ps-4"}
    ],
    "voteItems": ["ps-4"],
    "minutesRecordId": null,
    "actionItems": [],
    "publicVisible": true,
    "preMeetingDiscussionVoteIds": []
  },
  {
    "id": "meet-school-apr2026-b",
    "title": "April 2026 Board Session (advancement)",
    "meetingDate": "Monday, Apr 5, 2026 — 7:00 p.m.",
    "dateKey": "2026-04-05",
    "meetingType": "Board",
    "status": "Completed",
    "agendaItems": [
      {"id": "was-apb1", "title": "Capital campaign feasibility vendor", "informational": false, "linkedVoteId": "ps-5"}
    ],
    "voteItems": ["ps-5"],
    "minutesRecordId": null,
    "actionItems": [],
    "publicVisible": false,
    "preMeetingDiscussionVoteIds": []
  },
  {
    "id": "meet-school-apr2026-c",
    "title": "April 2026 Board Working Session",
    "meetingDate": "Friday, Apr 18, 2026 — 7:00 p.m.",
    "dateKey": "2026-04-18",
    "meetingType": "Board",
    "status": "Completed",
    "agendaItems": [
      {"id": "was-apc1", "title": "Athletics field lighting (tabled)", "informational": false, "linkedVoteId": "ps-6"}
    ],
    "voteItems": ["ps-6"],
    "minutesRecordId": null,
    "actionItems": [],
    "publicVisible": true,
    "preMeetingDiscussionVoteIds": ["ps-6"]
  },
  {
    "id": "meet-school-spring-mar",
    "title": "Board of Trustees Spring Meeting",
    "meetingDate": "Monday, Mar 10, 2026 \u2014 7:00 p.m.",
    "dateKey": "2026-03-10",
    "meetingType": "Board",
    "status": "Completed",
    "agendaItems": [
      {
        "id": "was-sp1",
        "title": "Enrollment & facilities update",
        "informational": true
      }
    ],
    "voteItems": [],
    "minutesRecordId": "mm-s-1",
    "actionItems": [],
    "publicVisible": true,
    "preMeetingDiscussionVoteIds": []
  },
  {
    "id": "meet-school-tuition-feb",
    "title": "Tuition and Scholarship Review Meeting",
    "meetingDate": "Tuesday, Feb 18, 2026 \u2014 6:00 p.m.",
    "dateKey": "2026-02-18",
    "meetingType": "Special",
    "status": "Completed",
    "agendaItems": [
      {
        "id": "was-t1",
        "title": "Aid demand scenarios",
        "informational": true
      }
    ],
    "voteItems": [],
    "minutesRecordId": "mm-s-2",
    "actionItems": [],
    "publicVisible": false,
    "preMeetingDiscussionVoteIds": []
  },
  {
    "id": "meet-school-public-jan",
    "title": "Facilities and Enrollment Planning (Public Session)",
    "meetingDate": "Thursday, Jan 8, 2026 \u2014 6:30 p.m.",
    "dateKey": "2026-01-08",
    "meetingType": "Public",
    "status": "Completed",
    "agendaItems": [
      {
        "id": "was-pu1",
        "title": "Campus plan overview",
        "informational": true
      }
    ],
    "voteItems": [],
    "minutesRecordId": "mm-s-3",
    "actionItems": [],
    "publicVisible": true,
    "preMeetingDiscussionVoteIds": []
  },
  {
    "id": "meet-school-exec-apr",
    "title": "Executive Committee (draft)",
    "meetingDate": "Wednesday, Apr 2, 2026 \u2014 8:00 a.m.",
    "dateKey": "2026-04-02",
    "meetingType": "Committee",
    "status": "Scheduled",
    "agendaItems": [
      {
        "id": "was-x1",
        "title": "Head of school support plan",
        "informational": true
      }
    ],
    "voteItems": [],
    "minutesRecordId": "mm-s-4",
    "actionItems": [],
    "publicVisible": false,
    "preMeetingDiscussionVoteIds": []
  }
];
