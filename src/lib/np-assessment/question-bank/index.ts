import type { NpSeedCategory } from "./types";
import { governanceQuestions } from "./governance";
import { legalQuestions } from "./legal";

/** Ordered assessment categories (expand with remaining PDF sections as seed files land). */
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
];
