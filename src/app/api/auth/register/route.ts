import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { validatePasswordStrength } from "@/lib/password-policy";

export async function POST(req: Request) {
  let body: { email?: string; password?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }
  const strength = validatePasswordStrength(password);
  if (!strength.valid) {
    return NextResponse.json({ error: "Password does not meet requirements", details: strength.errors }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }
  const passwordHash = await hash(password, 12);
  await prisma.user.create({
    data: {
      email,
      name: name || null,
      passwordHash,
      role: "BOARD_MEMBER",
    },
  });
  return NextResponse.json({ ok: true });
}