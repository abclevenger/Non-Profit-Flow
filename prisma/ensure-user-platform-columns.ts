/**
 * SQLite drift helper: add User platform columns if missing (when full `db push` is blocked).
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Col = { name: string };

async function main() {
  const cols = (await prisma.$queryRawUnsafe(`PRAGMA table_info(User)`)) as Col[];
  const names = new Set(cols.map((c: { name: string }) => c.name));

  const alters: string[] = [];
  if (!names.has("isPlatformAdmin")) {
    alters.push(`ALTER TABLE User ADD COLUMN isPlatformAdmin BOOLEAN NOT NULL DEFAULT 0`);
  }
  if (!names.has("allowDemoOrganizationAssignment")) {
    alters.push(`ALTER TABLE User ADD COLUMN allowDemoOrganizationAssignment BOOLEAN NOT NULL DEFAULT 0`);
  }
  if (!names.has("supabaseAuthId")) {
    alters.push(`ALTER TABLE User ADD COLUMN supabaseAuthId TEXT`);
  }
  if (!names.has("isDemoUser")) {
    alters.push(`ALTER TABLE User ADD COLUMN isDemoUser BOOLEAN NOT NULL DEFAULT 0`);
  }

  for (const sql of alters) {
    await prisma.$executeRawUnsafe(sql);
    console.log("Applied:", sql);
  }
  if (alters.length === 0) {
    console.log("User table already has platform columns.");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    void prisma.$disconnect();
    process.exit(1);
  });
