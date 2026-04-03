import { ExecutiveReportClient } from "@/components/np-assessment/ExecutiveReportClient";
import { NP_ASSESSMENT_CATEGORIES } from "@/lib/np-assessment/question-bank";
import {
  buildExecutiveReportModel,
  computeStandardsPillarCards,
} from "@/lib/np-assessment/standards-dashboard-model";
import { computeNpAssessmentReport, demoResponsesForCategories } from "@/lib/np-assessment/scoring";
import { getAppAuth } from "@/lib/auth/get-app-auth";

export const metadata = {
  title: "Executive report | Non-Profit Flow",
};

export default async function ExecutiveReportPage() {
  const categories = NP_ASSESSMENT_CATEGORIES;
  const responses = demoResponsesForCategories(categories);
  const report = computeNpAssessmentReport(categories, responses);
  const pillarCards = computeStandardsPillarCards(categories, responses);
  const executive = buildExecutiveReportModel(report, pillarCards);

  const auth = await getAppAuth();
  const orgName = auth?.user?.activeOrganization?.name;

  return <ExecutiveReportClient report={report} executive={executive} organizationName={orgName} />;
}
