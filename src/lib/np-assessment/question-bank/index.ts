import type { NpSeedCategory } from "./types";
import {
  advertisingQuestions,
  customerServiceSalesQuestions,
  financialActivitiesQuestions,
  hrStaffQuestions,
  hrVolunteersQuestions,
  marketResearchQuestions,
  publicRelationsQuestions,
  strategicPlanningQuestions,
} from "./extension-categories";
import { governanceQuestions } from "./governance";
import { legalQuestions } from "./legal";

/** Full organizational assessment — 10 sections; seeded into `NpAssessmentCategory` / `NpAssessmentQuestion`. */
export const NP_ASSESSMENT_CATEGORIES: NpSeedCategory[] = [
  {
    slug: "legal",
    name: "Conformance to Legal Filings and Regulations",
    displayOrder: 1,
    questions: legalQuestions,
  },
  {
    slug: "governance",
    name: "Governance",
    displayOrder: 2,
    questions: governanceQuestions,
  },
  {
    slug: "hr-staff",
    name: "Human Resources: Staff",
    displayOrder: 3,
    questions: hrStaffQuestions,
  },
  {
    slug: "hr-volunteers",
    name: "Human Resources: Volunteers",
    displayOrder: 4,
    questions: hrVolunteersQuestions,
  },
  {
    slug: "strategic-planning",
    name: "Strategic Planning",
    displayOrder: 5,
    questions: strategicPlanningQuestions,
  },
  {
    slug: "market-research",
    name: "Market Research",
    displayOrder: 6,
    questions: marketResearchQuestions,
  },
  {
    slug: "advertising",
    name: "Advertising",
    displayOrder: 7,
    questions: advertisingQuestions,
  },
  {
    slug: "public-relations",
    name: "Public Relations",
    displayOrder: 8,
    questions: publicRelationsQuestions,
  },
  {
    slug: "customer-service-sales",
    name: "Customer Service and Sales",
    displayOrder: 9,
    questions: customerServiceSalesQuestions,
  },
  {
    slug: "financial-activities",
    name: "Financial Activities",
    displayOrder: 10,
    questions: financialActivitiesQuestions,
  },
];
