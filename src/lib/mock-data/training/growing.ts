import type { BoardTrainingBundle } from "../types";

/**
 * TRAINING DATA — Board Member Training module.
 * Stored in mock data for demo; swap for API + per-user progress later.
 */
export const growingBoardTraining: BoardTrainingBundle = {
  "welcomeTitle": "New Board Member Orientation",
  "welcomeLead": "Welcome to a growing, multi-program organization. This hub orients you to oversight at scale and how we align as a board.",
  "missionSnapshot": "We deliver services across education, workforce, and health. The board balances ambition with risk, clarity between programs, and a strong partnership with leadership.",
  "progress": {
    "percentComplete": 55,
    "completedCount": 4,
    "remainingCount": 3,
    "lastViewedDate": "Apr 2, 2026",
    "documentsReviewed": 4,
    "documentsTotal": 6
  },
  "orientationTimeline": [
    {
      "id": "ot-g1",
      "weekLabel": "Week 1",
      "title": "Mission and portfolio",
      "summary": "How programs fit together and what the board sees in the packet each month."
    },
    {
      "id": "ot-g2",
      "weekLabel": "Week 2",
      "title": "Governance and reporting",
      "summary": "Unified outcomes reporting, committee structure, and ED-board cadence."
    },
    {
      "id": "ot-g3",
      "weekLabel": "Week 3",
      "title": "Policies and decisions",
      "summary": "Conflicts, confidentiality, and how major votes and resolutions are tracked."
    }
  ],
  "governanceBasics": [
    {
      "id": "gb-g1",
      "heading": "Fiduciary duties",
      "body": "With multiple programs, your job is to ask whether the whole enterprise stays solvent, compliant, and mission-true."
    },
    {
      "id": "gb-g2",
      "heading": "Board vs staff",
      "body": "Leadership runs operations; the board approves strategy, budget, and policy."
    },
    {
      "id": "gb-g3",
      "heading": "Oversight",
      "body": "Finance, audit, quality, and risk committees channel deep work; the full board focuses on direction and guardrails."
    },
    {
      "id": "gb-g4",
      "heading": "Meeting expectations",
      "body": "Packets are longer than a small shop; skim the exec summary first, then go deeper on your committee lane."
    }
  ],
  "quickAnswers": [
    {
      "id": "qa-g1",
      "question": "What is the board responsible for?",
      "answer": "Mission, multi-year strategy, financial sustainability, CEO oversight, and governance policies across all programs."
    },
    {
      "id": "qa-g2",
      "question": "Where do I find meeting materials?",
      "answer": "Portal under Documents and the monthly board packet. Committee leads may add pre-reads mid-month."
    },
    {
      "id": "qa-g3",
      "question": "How are votes handled?",
      "answer": "Major items are on the agenda with backup; some approvals use written consent between meetings."
    },
    {
      "id": "qa-g4",
      "question": "Who do I contact with questions?",
      "answer": "Board chair or chief governance lead for process; ED office for program context."
    }
  ],
  "resources": [
    {
      "id": "tr-g-handbook",
      "title": "Board handbook",
      "type": "handbook",
      "description": "Governance calendar, committee charters, and norms at scale.",
      "lastUpdated": "Mar 18, 2026",
      "href": "#",
      "recommended": true
    },
    {
      "id": "tr-g-bylaws",
      "title": "Bylaws",
      "type": "bylaws",
      "description": "Board structure, officer roles, and meeting rules.",
      "lastUpdated": "Nov 12, 2025",
      "href": "#"
    },
    {
      "id": "tr-g-coi",
      "title": "Conflict of interest policy",
      "type": "policy",
      "description": "Disclosure cadence and recusal expectations.",
      "lastUpdated": "Jan 20, 2026",
      "href": "#"
    },
    {
      "id": "tr-g-plan",
      "title": "Strategic plan",
      "type": "plan",
      "description": "Cross-program goals, metrics, and risk themes.",
      "lastUpdated": "Oct 1, 2025",
      "href": "#",
      "recommended": true
    },
    {
      "id": "tr-g-packet",
      "title": "Recent board packet",
      "type": "packet",
      "description": "Unified leadership briefing and committee reports.",
      "lastUpdated": "Apr 14, 2026",
      "href": "#"
    },
    {
      "id": "tr-g-orient",
      "title": "Orientation slide deck",
      "type": "orientation",
      "description": "Recorded orientation and slides for async review.",
      "lastUpdated": "Apr 1, 2026",
      "href": "#"
    }
  ],
  "modules": [
    {
      "id": "tm-g-welcome",
      "title": "Welcome to the organization",
      "summary": "Mission, leadership team, and how programs connect.",
      "required": true,
      "estimatedTime": "20 min",
      "status": "Complete",
      "category": "Welcome",
      "content": [
        "You will see how we talk about impact across sites and grant portfolios.",
        "Meet the senior team and how information flows to the board."
      ],
      "linkedResources": [
        "tr-g-handbook",
        "tr-g-plan"
      ]
    },
    {
      "id": "tm-g-role",
      "title": "Your role as a board member",
      "summary": "Oversight at scale: what good governance looks like here.",
      "required": true,
      "estimatedTime": "25 min",
      "status": "Complete",
      "category": "Your role",
      "content": [
        "You help leadership prioritize where to invest attention and capital.",
        "Recruitment looks for finance, programs, and community representation together."
      ],
      "linkedResources": [
        "tr-g-handbook"
      ]
    },
    {
      "id": "tm-g-gov",
      "title": "Governance basics",
      "summary": "Fiduciary duties, reporting, and board-staff alignment.",
      "required": true,
      "estimatedTime": "30 min",
      "status": "Complete",
      "category": "Governance basics",
      "content": [
        "Standardized reporting helps compare programs without drowning in detail.",
        "Executive session is used thoughtfully for personnel and sensitive matters."
      ],
      "linkedResources": [
        "tr-g-bylaws",
        "tr-g-coi"
      ]
    },
    {
      "id": "tm-g-policies",
      "title": "Key policies and expectations",
      "summary": "Conduct, confidentiality, data use, and conflicts.",
      "required": true,
      "estimatedTime": "25 min",
      "status": "In Progress",
      "category": "Policies",
      "content": [
        "Multi-site work means clear rules for data and partner agreements.",
        "When unsure, disclose early."
      ],
      "linkedResources": [
        "tr-g-coi",
        "tr-g-handbook"
      ]
    },
    {
      "id": "tm-g-meetings",
      "title": "Board meetings and decisions",
      "summary": "Agenda design, consent items, and decision logs.",
      "required": true,
      "estimatedTime": "22 min",
      "status": "Not Started",
      "category": "Meetings",
      "content": [
        "Expect a mix of strategic blocks and standing approvals.",
        "Resolutions and minutes tie back to the compliance calendar."
      ],
      "linkedResources": [
        "tr-g-packet"
      ]
    },
    {
      "id": "tm-g-docs",
      "title": "Important documents",
      "summary": "Handbook, bylaws, plan, and orientation media.",
      "required": false,
      "estimatedTime": "40 min",
      "status": "Not Started",
      "category": "Documents",
      "content": [
        "Use the handbook table of contents rather than reading cover to cover in one sitting.",
        "Optional deck reinforces what you see live in orientation."
      ],
      "linkedResources": [
        "tr-g-bylaws",
        "tr-g-orient"
      ]
    },
    {
      "id": "tm-g-priorities",
      "title": "Current priorities and strategic direction",
      "summary": "Expansion, reporting maturity, and leadership structure.",
      "required": false,
      "estimatedTime": "18 min",
      "status": "Not Started",
      "category": "Strategy",
      "content": [
        "Current board conversations focus on program growth and leadership clarity.",
        "Your questions help stress-test assumptions before big commitments."
      ],
      "linkedResources": [
        "tr-g-plan"
      ]
    }
  ]
};
