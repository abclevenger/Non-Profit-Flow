/**
 * SQLite drift helper: add Agency.isDemoAgency if missing.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Col = { name: string };

async function main() {
  const cols = (await prisma.$queryRawUnsafe(`PRAGMA table_info(Agency)`)) as Col[];
  const names = new Set(cols.map((c: { name: string }) => c.name));

  if (!names.has("isDemoAgency")) {
    await prisma.$executeRawUnsafe(`ALTER TABLE Agency ADD COLUMN isDemoAgency BOOLEAN NOT NULL DEFAULT 0`);
    console.log("Applied: ALTER TABLE Agency ADD COLUMN isDemoAgency …");
  } else {
    console.log("Agency.isDemoAgency already present.");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    void prisma.$disconnect();
    process.exit(1);
  });
