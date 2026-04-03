import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

const HOUR_MS = 60 * 60 * 1000;

export async function POST(req: Request) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash) {
    return NextResponse.json({
      ok: true,
      message: "If an account exists for this email, you will receive reset instructions.",
    });
  }
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + HOUR_MS);
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });
  const baseUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const resetLink = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
  const devHint =
    process.env.NODE_ENV === "development"
      ? { resetLink, expiresAt: expires.toISOString() }
      : undefined;
  return NextResponse.json({
    ok: true,
    message:
      "If an account exists for this email, a reset link has been issued. Links expire in one hour. During development, the link is returned in the response for convenience.",
    ...(devHint ? { devHint } : {}),
  });
}