import type { BoardTrainingBundle } from "../types";

/**
 * TRAINING DATA — Board Member Training module.
 * Stored in mock data for demo; swap for API + per-user progress later.
 */
export const privateSchoolBoardTraining: BoardTrainingBundle = {
  "welcomeTitle": "New Board Member Orientation",
  "welcomeLead": "Welcome to the board of St. Mark's Academy. This orientation connects mission, families, and the school's governance role.",
  "missionSnapshot": "We provide faith-based education with academic rigor. The board supports the head of school, safeguards mission and trust, and thinks about long-term sustainability.",
  "progress": {
    "percentComplete": 38,
    "completedCount": 2,
    "remainingCount": 5,
    "lastViewedDate": "Mar 30, 2026",
    "documentsReviewed": 2,
    "documentsTotal": 6
  },
  "orientationTimeline": [
    {
      "id": "ot-s1",
      "weekLabel": "Week 1",
      "title": "School overview",
      "summary": "Mission, formation, enrollment, and how families experience the school."
    },
    {
      "id": "ot-s2",
      "weekLabel": "Week 2",
      "title": "Governance and leadership",
      "summary": "Board vs head of school, policy oversight, and committee rhythm."
    },
    {
      "id": "ot-s3",
      "weekLabel": "Week 3",
      "title": "Policies and community trust",
      "summary": "Handbook, safety, tuition and aid, and public-facing decisions."
    }
  ],
  "governanceBasics": [
    {
      "id": "gb-s1",
      "heading": "Fiduciary duties",
      "body": "You steward the mission, finances, and reputation of the school in the eyes of families, parish or sponsors, and regulators."
    },
    {
      "id": "gb-s2",
      "heading": "Board vs school leadership",
      "body": "The head of school runs daily operations; the board hires, evaluates, and supports that leader and sets major policy."
    },
    {
      "id": "gb-s3",
      "heading": "Oversight",
      "body": "Focus on safety, finance, advancement, and educational outcomes through board-appropriate dashboards."
    },
    {
      "id": "gb-s4",
      "heading": "Meetings and community",
      "body": "Expect transparent processes for handbook and calendar decisions; confidentiality still matters for personnel and families."
    }
  ],
  "quickAnswers": [
    {
      "id": "qa-s1",
      "question": "What is the board responsible for?",
      "answer": "Mission, head-of-school oversight, major policy and finance, facilities strategy, and preserving community trust."
    },
    {
      "id": "qa-s2",
      "question": "Where do I find meeting materials?",
      "answer": "Board portal and monthly packet; advancement and facilities committees may add focused pre-reads."
    },
    {
      "id": "qa-s3",
      "question": "How are votes handled?",
      "answer": "Tuition, handbook, and capital items are typically board votes after committee recommendation."
    },
    {
      "id": "qa-s4",
      "question": "Who do I contact with questions?",
      "answer": "Board chair or governance liaison; head of school office for school operations."
    }
  ],
  "resources": [
    {
      "id": "tr-s-handbook",
      "title": "Board handbook",
      "type": "handbook",
      "description": "Board-school partnership, committees, and public communication norms.",
      "lastUpdated": "Feb 8, 2026",
      "href": "#",
      "recommended": true
    },
    {
      "id": "tr-s-bylaws",
      "title": "Bylaws",
      "type": "bylaws",
      "description": "Corporate structure, membership, and meetings.",
      "lastUpdated": "Aug 1, 2025",
      "href": "#"
    },
    {
      "id": "tr-s-coi",
      "title": "Conflict of interest policy",
      "type": "policy",
      "description": "Family relationships, vendors, and parish connections.",
      "lastUpdated": "Jan 12, 2026",
      "href": "#"
    },
    {
      "id": "tr-s-plan",
      "title": "Strategic plan",
      "type": "plan",
      "description": "Enrollment, campus, advancement, and formation priorities.",
      "lastUpdated": "Sep 15, 2025",
      "href": "#"
    },
    {
      "id": "tr-s-packet",
      "title": "Recent board packet",
      "type": "packet",
      "description": "Enrollment, facilities, and finance updates.",
      "lastUpdated": "Apr 3, 2026",
      "href": "#",
      "recommended": true
    },
    {
      "id": "tr-s-orient",
      "title": "Parent and family handbook (summary)",
      "type": "orientation",
      "description": "What families see; aligns board policy work to daily school life.",
      "lastUpdated": "Mar 1, 2026",
      "href": "#"
    }
  ],
  "modules": [
    {
      "id": "tm-s-welcome",
      "title": "Welcome to the organization",
      "summary": "Mission, leadership, and how the school serves families.",
      "required": true,
      "estimatedTime": "20 min",
      "status": "Complete",
      "category": "Welcome",
      "content": [
        "Formation and academics are both part of how we define success.",
        "You will see how enrollment and parish or sponsor relationships shape planning."
      ],
      "linkedResources": [
        "tr-s-handbook",
        "tr-s-plan"
      ]
    },
    {
      "id": "tm-s-role",
      "title": "Your role as a board member",
      "summary": "Policy oversight, head-of-school partnership, and community trust.",
      "required": true,
      "estimatedTime": "28 min",
      "status": "Complete",
      "category": "Your role",
      "content": [
        "You are an ambassador for the mission without managing faculty or families directly.",
        "Board decisions should be explainable to the community we serve."
      ],
      "linkedResources": [
        "tr-s-handbook"
      ]
    },
    {
      "id": "tm-s-gov",
      "title": "Governance basics",
      "summary": "Fiduciary duties in a school context and delegation to leadership.",
      "required": true,
      "estimatedTime": "32 min",
      "status": "In Progress",
      "category": "Governance basics",
      "content": [
        "Know the difference between governance questions and operational ones before meetings.",
        "Evaluation of the head of school is structured and confidential."
      ],
      "linkedResources": [
        "tr-s-bylaws",
        "tr-s-coi"
      ]
    },
    {
      "id": "tm-s-policies",
      "title": "Key policies and expectations",
      "summary": "Handbook lines, safety, tuition and aid, conduct.",
      "required": true,
      "estimatedTime": "26 min",
      "status": "Not Started",
      "category": "Policies",
      "content": [
        "Policies balance compassion with consistency for hundreds of families.",
        "Conflicts involving your family should be disclosed early."
      ],
      "linkedResources": [
        "tr-s-coi",
        "tr-s-orient"
      ]
    },
    {
      "id": "tm-s-meetings",
      "title": "Board meetings and decisions",
      "summary": "Agendas, committees, and how major school decisions move.",
      "required": true,
      "estimatedTime": "22 min",
      "status": "Not Started",
      "category": "Meetings",
      "content": [
        "Facilities and advancement often have dedicated committee paths before the full board.",
        "Minutes reflect approvals and key direction, especially on policy."
      ],
      "linkedResources": [
        "tr-s-packet"
      ]
    },
    {
      "id": "tm-s-docs",
      "title": "Important documents",
      "summary": "Bylaws, strategic plan, board and family handbooks.",
      "required": false,
      "estimatedTime": "38 min",
      "status": "Not Started",
      "category": "Documents",
      "content": [
        "Reading the family handbook summary helps you connect policy to parent experience.",
        "Campus master plan excerpts appear in packets during capital seasons."
      ],
      "linkedResources": [
        "tr-s-bylaws",
        "tr-s-orient"
      ]
    },
    {
      "id": "tm-s-priorities",
      "title": "Current priorities and strategic direction",
      "summary": "Enrollment, facilities phases, scholarships, and parent engagement.",
      "required": false,
      "estimatedTime": "16 min",
      "status": "Not Started",
      "category": "Strategy",
      "content": [
        "Current themes include sustainable tuition and aid, phased facilities work, and clear messaging in a competitive market.",
        "Your questions help leadership test tradeoffs before public commitments."
      ],
      "linkedResources": [
        "tr-s-plan"
      ]
    }
  ]
};
