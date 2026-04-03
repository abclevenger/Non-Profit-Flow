import "server-only";

import { prisma } from "@/lib/prisma";
import type { NpSeedCategory } from "./question-bank/types";

/** Active question catalog from database (after seed). */
export async function loadNpAssessmentCatalogFromDb(): Promise<NpSeedCategory[]> {
  const rows = await prisma.npAssessmentCategory.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      questions: { orderBy: { displayOrder: "asc" } },
    },
  });

  return rows.map((c) => ({
    slug: c.slug,
    name: c.name,
    displayOrder: c.displayOrder,
    questions: c.questions.map((q) => ({
      code: q.indicatorCode,
      rating: q.ratingType as "E" | "R" | "A",
      text: q.questionText,
      displayOrder: q.displayOrder,
    })),
  }));
}
