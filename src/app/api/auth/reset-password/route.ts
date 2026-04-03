import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { validatePasswordStrength } from "@/lib/password-policy";

export async function POST(req: Request) {
  let body: { token?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const token = typeof body.token === "string" ? body.token.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!token || !password) {
    return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
  }
  const strength = validatePasswordStrength(password);
  if (!strength.valid) {
    return NextResponse.json({ error: "Password does not meet requirements", details: strength.errors }, { status: 400 });
  }
  const row = await prisma.verificationToken.findUnique({ where: { token } });
  if (!row || row.expires < new Date()) {
    return NextResponse.json({ error: "This reset link is invalid or has expired. Request a new one." }, { status: 400 });
  }
  const email = row.identifier.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    await prisma.verificationToken.delete({ where: { token } });
    return NextResponse.json({ error: "Account not found" }, { status: 400 });
  }
  const passwordHash = await hash(password, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    prisma.verificationToken.delete({ where: { token } }),
  ]);
  return NextResponse.json({ ok: true });
}