import type { BoardTrainingBundle } from "../types";

/**
 * TRAINING DATA — Board Member Training module.
 * Stored in mock data for demo; swap for API + per-user progress later.
 */
export const communityBoardTraining: BoardTrainingBundle = {
  "welcomeTitle": "New Board Member Orientation",
  "welcomeLead": "Start here for a clear picture of who we serve, how the board helps, and what to expect in your first weeks.",
  "missionSnapshot": "We strengthen neighborhoods through programs and partnerships. The board keeps mission and community trust at the center while supporting staff who run day-to-day operations.",
  "progress": {
    "percentComplete": 42,
    "completedCount": 3,
    "remainingCount": 4,
    "lastViewedDate": "Apr 1, 2026",
    "documentsReviewed": 3,
    "documentsTotal": 6
  },
  "orientationTimeline": [
    {
      "id": "ot-c1",
      "weekLabel": "Week 1",
      "title": "Organization overview",
      "summary": "Mission, leadership, and how programs reach families. Skim the handbook and bylaws index."
    },
    {
      "id": "ot-c2",
      "weekLabel": "Week 2",
      "title": "Governance basics",
      "summary": "Fiduciary role, committees, and how the board partners with the executive director."
    },
    {
      "id": "ot-c3",
      "weekLabel": "Week 3",
      "title": "Policies and meetings",
      "summary": "Expectations, conflicts of interest, and how packets and votes work before your first full meeting."
    }
  ],
  "governanceBasics": [
    {
      "id": "gb-c1",
      "heading": "Fiduciary duties",
      "body": "Act in the organizations best interest, stay informed, and ask questions when something is unclear."
    },
    {
      "id": "gb-c2",
      "heading": "Board vs staff",
      "body": "The board sets direction, approves major decisions, and oversees health and compliance."
    },
    {
      "id": "gb-c3",
      "heading": "Oversight",
      "body": "You review finances, major risks, and executive performance through a governance lens."
    },
    {
      "id": "gb-c4",
      "heading": "Meetings",
      "body": "Read the packet ahead of time, join committees you care about, and share context from the community you represent."
    }
  ],
  "quickAnswers": [
    {
      "id": "qa-c1",
      "question": "What is the board responsible for?",
      "answer": "Mission, strategy, financial health, executive oversight, and governance policies."
    },
    {
      "id": "qa-c2",
      "question": "Where do I find meeting materials?",
      "answer": "Board packets are shared before each meeting. Orientation PDFs live under Resources below."
    },
    {
      "id": "qa-c3",
      "question": "How are votes handled?",
      "answer": "Most formal votes happen in meetings after discussion. The Voting area shows timing when used."
    },
    {
      "id": "qa-c4",
      "question": "Who do I contact with questions?",
      "answer": "Start with the board chair or governance committee lead."
    }
  ],
  "resources": [
    {
      "id": "tr-c-handbook",
      "title": "Board handbook",
      "type": "handbook",
      "description": "Roles, meeting norms, and how to stay engaged between meetings.",
      "lastUpdated": "Mar 10, 2026",
      "href": "#",
      "recommended": true
    },
    {
      "id": "tr-c-bylaws",
      "title": "Bylaws",
      "type": "bylaws",
      "description": "Legal structure: officers, meetings, and amendment process.",
      "lastUpdated": "Jan 5, 2026",
      "href": "#"
    },
    {
      "id": "tr-c-coi",
      "title": "Conflict of interest policy",
      "type": "policy",
      "description": "When to disclose and how the board manages conflicts.",
      "lastUpdated": "Feb 2, 2026",
      "href": "#"
    },
    {
      "id": "tr-c-plan",
      "title": "Strategic plan (summary)",
      "type": "plan",
      "description": "Three-year priorities and how programs connect to the mission.",
      "lastUpdated": "Dec 1, 2025",
      "href": "#"
    },
    {
      "id": "tr-c-packet",
      "title": "Recent board packet",
      "type": "packet",
      "description": "Latest agenda, reports, and materials for the upcoming meeting.",
      "lastUpdated": "Apr 12, 2026",
      "href": "#",
      "recommended": true
    },
    {
      "id": "tr-c-orient",
      "title": "Orientation packet (PDF)",
      "type": "orientation",
      "description": "Printable welcome packet for new members.",
      "lastUpdated": "Mar 28, 2026",
      "href": "#"
    }
  ],
  "modules": [
    {
      "id": "tm-c-welcome",
      "title": "Welcome to the organization",
      "summary": "Mission, leadership, and current priorities in plain language.",
      "required": true,
      "estimatedTime": "20 min",
      "status": "Complete",
      "category": "Welcome",
      "content": [
        "You will see how we describe our work to neighbors, partners, and donors.",
        "Meet the leadership team and how committees connect to programs you care about."
      ],
      "linkedResources": [
        "tr-c-handbook",
        "tr-c-plan"
      ]
    },
    {
      "id": "tm-c-role",
      "title": "Your role as a board member",
      "summary": "What the board does, what it does not do, and how volunteers fit in here.",
      "required": true,
      "estimatedTime": "25 min",
      "status": "Complete",
      "category": "Your role",
      "content": [
        "In a volunteer-heavy organization, clarity between governance and operations matters.",
        "Recruitment and onboarding are board-led."
      ],
      "linkedResources": [
        "tr-c-handbook"
      ]
    },
    {
      "id": "tm-c-gov",
      "title": "Governance basics",
      "summary": "Fiduciary duties, oversight, and working with the executive director.",
      "required": true,
      "estimatedTime": "30 min",
      "status": "In Progress",
      "category": "Governance basics",
      "content": [
        "Focus on the big picture: finances, risk, and mission alignment.",
        "Ask for what you need to feel prepared."
      ],
      "linkedResources": [
        "tr-c-bylaws",
        "tr-c-coi"
      ]
    },
    {
      "id": "tm-c-policies",
      "title": "Key policies and expectations",
      "summary": "Conduct, confidentiality, and conflict standards in everyday terms.",
      "required": true,
      "estimatedTime": "25 min",
      "status": "Not Started",
      "category": "Policies",
      "content": [
        "Policies protect the organization and the people we serve.",
        "You will know when to step back from a decision where you have a personal interest."
      ],
      "linkedResources": [
        "tr-c-coi",
        "tr-c-handbook"
      ]
    },
    {
      "id": "tm-c-meetings",
      "title": "Board meetings and decisions",
      "summary": "Packets, agendas, discussion, and how decisions get recorded.",
      "required": true,
      "estimatedTime": "20 min",
      "status": "Not Started",
      "category": "Meetings",
      "content": [
        "We value discussion before votes; consent agendas handle routine items.",
        "Minutes capture decisions, not every comment."
      ],
      "linkedResources": [
        "tr-c-packet"
      ]
    },
    {
      "id": "tm-c-docs",
      "title": "Important documents",
      "summary": "Bylaws, plan, handbook—what to skim first.",
      "required": false,
      "estimatedTime": "35 min",
      "status": "Not Started",
      "category": "Documents",
      "content": [
        "You do not need to memorize everything; know where to find answers.",
        "Orientation packet is optional but helpful before your first meeting."
      ],
      "linkedResources": [
        "tr-c-bylaws",
        "tr-c-orient"
      ]
    },
    {
      "id": "tm-c-priorities",
      "title": "Current priorities and strategic direction",
      "summary": "What the board and staff are focused on this year.",
      "required": false,
      "estimatedTime": "15 min",
      "status": "Not Started",
      "category": "Strategy",
      "content": [
        "Tie what you read here to committee work and community listening.",
        "Strategic refresh may surface in meetings."
      ],
      "linkedResources": [
        "tr-c-plan"
      ]
    }
  ]
};
