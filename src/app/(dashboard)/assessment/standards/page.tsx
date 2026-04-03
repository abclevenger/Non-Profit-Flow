import { StandardsHubClient } from "@/components/np-assessment/StandardsHubClient";
import { NP_ASSESSMENT_CATEGORIES } from "@/lib/np-assessment/question-bank";
import { computeStandardsPillarCards } from "@/lib/np-assessment/standards-dashboard-model";
import { computeNpAssessmentReport, demoResponsesForCategories } from "@/lib/np-assessment/scoring";

export const metadata = {
  title: "Standards dashboard | Non-Profit Flow",
};

export default function StandardsDashboardPage() {
  const categories = NP_ASSESSMENT_CATEGORIES;
  const responses = demoResponsesForCategories(categories);
  const report = computeNpAssessmentReport(categories, responses);
  const pillarCards = computeStandardsPillarCards(categories, responses);

  return <StandardsHubClient report={report} pillarCards={pillarCards} />;
}
