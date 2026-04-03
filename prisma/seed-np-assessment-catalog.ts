/**
 * Upserts global assessment categories and questions from `NP_ASSESSMENT_CATEGORIES`.
 * Run from `prisma/seed.ts` or `npx tsx prisma/seed-np-assessment-catalog.ts`.
 */
import type { PrismaClient } from "@prisma/client";
import { PrismaClient as PrismaCtor } from "@prisma/client";
import { NP_ASSESSMENT_CATEGORIES } from "../src/lib/np-assessment/question-bank";

export async function seedNpAssessmentCatalog(prisma: PrismaClient) {
  for (const cat of NP_ASSESSMENT_CATEGORIES) {
    const row = await prisma.npAssessmentCategory.upsert({
      where: { slug: cat.slug },
      create: {
        slug: cat.slug,
        name: cat.name,
        displayOrder: cat.displayOrder,
      },
      update: {
        name: cat.name,
        displayOrder: cat.displayOrder,
      },
    });

    for (const q of cat.questions) {
      await prisma.npAssessmentQuestion.upsert({
        where: { indicatorCode: q.code },
        create: {
          categoryId: row.id,
          indicatorCode: q.code,
          questionText: q.text,
          ratingType: q.rating,
          displayOrder: q.displayOrder,
        },
        update: {
          categoryId: row.id,
          questionText: q.text,
          ratingType: q.rating,
          displayOrder: q.displayOrder,
        },
      });
    }
  }
  console.log("NP assessment catalog seeded:", NP_ASSESSMENT_CATEGORIES.length, "categories");
}

async function main() {
  const prisma = new PrismaCtor();
  try {
    await seedNpAssessmentCatalog(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
