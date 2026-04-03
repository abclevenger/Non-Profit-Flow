import { NpAssessmentReportView } from "@/components/np-assessment/NpAssessmentReportView";
import { NP_ASSESSMENT_CATEGORIES } from "@/lib/np-assessment/question-bank";
import {
  buildAiSummaryPayload,
  computeNpAssessmentReport,
  demoResponsesForCategories,
  questionsMapFromCategories,
} from "@/lib/np-assessment/scoring";

export const metadata = {
  title: "Assessment report | Non-Profit Flow",
};

/**
 * Demo report using seeded responses over the current question bank.
 * Replace with DB-backed assessment + participant merge when wired.
 */
export default function AssessmentReportPage() {
  const categories = NP_ASSESSMENT_CATEGORIES;
  const responses = demoResponsesForCategories(categories);
  const report = computeNpAssessmentReport(categories, responses);
  const qMap = questionsMapFromCategories(categories);
  const aiPayload = buildAiSummaryPayload(report, qMap);

  return <NpAssessmentReportView report={report} aiPayload={aiPayload} />;
}
