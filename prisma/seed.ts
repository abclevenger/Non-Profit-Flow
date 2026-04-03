import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@board.demo";
  const memberEmail = "member@board.demo";
  const adminPass = await hash("BoardAdmin1!z9", 12);
  const memberPass = await hash("MemberPass1!z9", 12);
  const demoTotpSecret = "JBSWY3DPEHPK3PXP";

  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      name: "Board Admin",
      passwordHash: adminPass,
      role: "ADMIN",
      twoFactorEnabled: true,
      twoFactorSecret: demoTotpSecret,
    },
    update: {
      passwordHash: adminPass,
      role: "ADMIN",
      twoFactorEnabled: true,
      twoFactorSecret: demoTotpSecret,
    },
  });

  await prisma.user.upsert({
    where: { email: memberEmail },
    create: {
      email: memberEmail,
      name: "Sample Board Member",
      passwordHash: memberPass,
      role: "BOARD_MEMBER",
      twoFactorEnabled: false,
      twoFactorSecret: null,
    },
    update: {
      passwordHash: memberPass,
      role: "BOARD_MEMBER",
    },
  });

  console.log("Seed complete.");
  console.log("Admin:", adminEmail, "/ BoardAdmin1!z9");
  console.log("  2FA (TOTP) secret for authenticator apps:", demoTotpSecret);
  console.log("Member:", memberEmail, "/ MemberPass1!z9 (no 2FA)");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });