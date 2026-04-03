import type { MeetingMinutesRecord } from "../types";

/** Minutes mock data — private school / faith-based. */
export const privateSchoolMeetingMinutes: MeetingMinutesRecord[] = [
  {
    "id": "mm-s-1",
    "meetingId": "meet-school-spring-mar",
    "meetingTitle": "Board of Trustees Spring Meeting",
    "meetingDate": "Mar 10, 2026",
    "meetingType": "Regular",
    "status": "Approved",
    "summary": "Enrollment update, facilities phase-one status, and parent engagement survey headline results.",
    "publicSummary": "Trustees reviewed enrollment and campus planning; parent engagement initiatives noted.",
    "attendees": [
      "Rebecca Thompson (Chair)",
      "Fr. Michael Brennan",
      "Trustees (7)"
    ],
    "discussionNotes": "Facilities timeline stress discussed; board asked for phased contractor options.",
    "decisionsMade": [
      {
        "id": "d-s-1",
        "title": "Parent survey action plan",
        "summary": "Adopt three working group priorities.",
        "outcome": "Approved"
      },
      {
        "id": "d-s-2",
        "title": "Head of school goals (mid-cycle)",
        "summary": "Accepted progress narrative.",
        "outcome": "Accepted"
      }
    ],
    "linkedVotes": [],
    "linkedAgendaItems": [
      "Enrollment",
      "Facilities",
      "Parent engagement"
    ],
    "followUpActions": [
      {
        "id": "fu-s-1",
        "task": "Publish spring board summary to website",
        "owner": "Advancement",
        "dueDate": "Mar 24, 2026",
        "status": "Open"
      },
      {
        "id": "fu-s-2",
        "task": "Finalize phase-one bid comparison matrix",
        "owner": "Facilities chair",
        "dueDate": "Apr 5, 2026",
        "status": "Open"
      }
    ],
    "preparedBy": "Board secretary",
    "approvedDate": "Mar 20, 2026",
    "publicVisible": true,
    "linkedDocuments": [
      {
        "id": "doc-s-1",
        "title": "Spring 2026 approved minutes",
        "href": "#"
      }
    ],
    "createdAt": "Mar 12, 2026",
    "updatedAt": "Mar 20, 2026",
    "draftCreatedAt": "Mar 12, 2026",
    "sentForReviewAt": "Mar 14, 2026"
  },
  {
    "id": "mm-s-2",
    "meetingId": "meet-school-tuition-feb",
    "meetingTitle": "Tuition and Scholarship Review Meeting",
    "meetingDate": "Feb 18, 2026",
    "meetingType": "Special",
    "status": "In Review",
    "summary": "Draft minutes on aid demand, indexed tuition adjustment scenario, and gala targets.",
    "attendees": [
      "Finance committee",
      "Head of school",
      "Advancement director"
    ],
    "discussionNotes": "Sensitive figures \u2014 internal review only at this stage.",
    "decisionsMade": [
      {
        "id": "d-s-3",
        "title": "Scenario A (placeholder)",
        "summary": "Board deferred vote pending full board packet.",
        "outcome": "Deferred"
      }
    ],
    "linkedVotes": [],
    "linkedAgendaItems": [
      "Tuition model",
      "Scholarship pool"
    ],
    "followUpActions": [
      {
        "id": "fu-s-3",
        "task": "Model three aid scenarios for April board",
        "owner": "CFO",
        "dueDate": "Apr 1, 2026",
        "status": "Open"
      }
    ],
    "preparedBy": "Finance committee clerk",
    "publicVisible": false,
    "linkedDocuments": [],
    "createdAt": "Feb 20, 2026",
    "updatedAt": "Feb 24, 2026",
    "draftCreatedAt": "Feb 20, 2026",
    "sentForReviewAt": "Feb 22, 2026"
  },
  {
    "id": "mm-s-3",
    "meetingId": "meet-school-public-jan",
    "meetingTitle": "Facilities and Enrollment Planning Meeting",
    "meetingDate": "Jan 8, 2026",
    "meetingType": "Public",
    "status": "Published",
    "summary": "Public session on campus plan outline; board received community questions.",
    "publicSummary": "Board hosted a public session on campus improvements and enrollment trends.",
    "attendees": [
      "Board",
      "Head of school",
      "Community attendees (approx. 40)"
    ],
    "discussionNotes": "Q and A captured in appendix for full board packet.",
    "decisionsMade": [
      {
        "id": "d-s-4",
        "title": "Public comment themes",
        "summary": "Log for policy follow-up \u2014 no votes at this session.",
        "outcome": "Recorded"
      }
    ],
    "linkedVotes": [],
    "linkedAgendaItems": [
      "Campus plan overview",
      "Enrollment trends"
    ],
    "followUpActions": [
      {
        "id": "fu-s-4",
        "task": "Post public session recap to website",
        "owner": "Communications",
        "dueDate": "Jan 15, 2026",
        "status": "Done"
      }
    ],
    "preparedBy": "Board secretary",
    "approvedDate": "Jan 18, 2026",
    "publishedDate": "Jan 19, 2026",
    "publicVisible": true,
    "linkedDocuments": [
      {
        "id": "doc-s-2",
        "title": "Public session recap (PDF)",
        "href": "#"
      }
    ],
    "createdAt": "Jan 10, 2026",
    "updatedAt": "Jan 19, 2026",
    "draftCreatedAt": "Jan 10, 2026",
    "sentForReviewAt": "Jan 12, 2026"
  },
  {
    "id": "mm-s-4",
    "meetingId": "meet-school-exec-apr",
    "meetingTitle": "Executive Committee (Draft)",
    "meetingDate": "Apr 2, 2026",
    "meetingType": "Committee",
    "status": "Draft",
    "summary": "Draft notes on head-of-school support plan \u2014 not finalized.",
    "attendees": [
      "Chair",
      "Vice chair",
      "Head of school"
    ],
    "discussionNotes": "Confidential draft.",
    "decisionsMade": [],
    "linkedVotes": [],
    "linkedAgendaItems": [
      "ED support"
    ],
    "followUpActions": [
      {
        "id": "fu-s-5",
        "task": "Schedule full board briefing",
        "owner": "Chair",
        "dueDate": "Apr 28, 2026",
        "status": "Open"
      }
    ],
    "preparedBy": "Board secretary",
    "publicVisible": false,
    "linkedDocuments": [],
    "createdAt": "Apr 3, 2026",
    "updatedAt": "Apr 3, 2026",
    "draftCreatedAt": "Apr 3, 2026"
  }
];
