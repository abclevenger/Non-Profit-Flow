/**
 * Promote a user to agency master / platform operator (see docs/saas-governance-model.md).
 * Usage: npx tsx prisma/promote-agency-master.ts [email]
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const raw = (process.argv[2] ?? "ashley@ymbs.pro").trim();
  const normalized = raw.toLowerCase();

  const rows = await prisma.$queryRawUnsafe<{ id: string; email: string }[]>(
    `SELECT id, email FROM User WHERE LOWER(email) = ?`,
    normalized,
  );

  if (rows.length === 0) {
    console.error(`No user found with email matching: ${raw}`);
    process.exitCode = 1;
    return;
  }

  const { id, email } = rows[0];
  await prisma.user.update({
    where: { id },
    data: {
      isPlatformAdmin: true,
      allowDemoOrganizationAssignment: true,
      role: "ADMIN",
    },
  });

  console.log(`Updated ${email} → isPlatformAdmin=true, allowDemoOrganizationAssignment=true, role=ADMIN`);

  try {
    const agencies = await prisma.agency.findMany({ select: { id: true, name: true } });
    for (const a of agencies) {
      await prisma.agencyMember.upsert({
        where: { agencyId_userId: { agencyId: a.id, userId: id } },
        create: { agencyId: a.id, userId: id, role: "AGENCY_ADMIN", status: "ACTIVE" },
        update: { role: "AGENCY_ADMIN", status: "ACTIVE" },
      });
    }
    if (agencies.length > 0) {
      console.log(`Ensured AGENCY_ADMIN on ${agencies.length} agency/agencies: ${agencies.map((x) => x.name).join(", ")}`);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("does not exist") || msg.includes("P2021")) {
      console.warn("Skipped agency memberships (Agency tables not in this database). Platform admin still has full org access.");
    } else {
      throw e;
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    void prisma.$disconnect();
    process.exit(1);
  });
