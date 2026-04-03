import type { BoardTrainingBundle, TrainingModuleItem, TrainingResource } from "@/lib/mock-data/types";

export type TrainingSummaryStats = {
  orientationPercent: number;
  requiredTopics: number;
  recommendedResources: number;
  documentsReviewed: number;
  documentsTotal: number;
};

export function trainingSummaryStats(bundle: BoardTrainingBundle): TrainingSummaryStats {
  const requiredTopics = bundle.modules.filter((m) => m.required).length;
  const recommendedResources = bundle.resources.filter((r) => r.recommended).length;
  return {
    orientationPercent: bundle.progress.percentComplete,
    requiredTopics,
    recommendedResources,
    documentsReviewed: bundle.progress.documentsReviewed,
    documentsTotal: bundle.progress.documentsTotal,
  };
}

export function requiredModules(bundle: BoardTrainingBundle): TrainingModuleItem[] {
  return bundle.modules.filter((m) => m.required);
}

export function recommendedResourcesList(bundle: BoardTrainingBundle): TrainingResource[] {
  return bundle.resources.filter((r) => r.recommended);
}

export function overviewRequiredModules(bundle: BoardTrainingBundle, n: number): TrainingModuleItem[] {
  return requiredModules(bundle).slice(0, n);
}

export function overviewTrainingSummaryLine(bundle: BoardTrainingBundle): string {
  const req = bundle.modules.filter((m) => m.required).length;
  const done = bundle.modules.filter((m) => m.status === "Complete").length;
  const remainDocs = Math.max(0, bundle.progress.documentsTotal - bundle.progress.documentsReviewed);
  return `${req} required topics · ${done} completed · ${remainDocs} document${remainDocs === 1 ? "" : "s"} still to review`;
}
