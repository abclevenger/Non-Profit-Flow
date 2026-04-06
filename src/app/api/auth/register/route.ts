import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { validatePasswordStrength } from "@/lib/password-policy";
import { createServiceRoleSupabaseClient, isServiceRoleConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function isPrismaConnectionError(err: unknown): boolean {
  if (err instanceof Prisma.PrismaClientInitializationError) return true;
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return err.code === "P1001" || err.code === "P1017";
  }
  const msg = err instanceof Error ? err.message : String(err);
  return /can't reach database|connection refused|timeout|P1001|P1017/i.test(msg);
}

export async function POST(req: Request) {
  try {
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
      return NextResponse.json(
        { error: "Password does not meet requirements", details: strength.errors },
        { status: 400 },
      );
    }
    if (!isServiceRoleConfigured()) {
      return NextResponse.json(
        {
          error:
            "Registration is not available: server auth is not fully configured (missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL).",
        },
        { status: 503 },
      );
    }

    let existing;
    try {
      existing = await prisma.user.findUnique({ where: { email } });
    } catch (dbErr) {
      console.error("[register] database lookup failed", dbErr);
      const hint = isPrismaConnectionError(dbErr)
        ? "Cannot reach the database. Check DATABASE_URL on the server (e.g. Vercel env) and redeploy."
        : "Database error. Try again later.";
      return NextResponse.json({ error: hint }, { status: 503 });
    }
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const admin = createServiceRoleSupabaseClient("api/auth/register");
    const { data: created, error: authErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: name ? { full_name: name, name } : undefined,
    });

    if (authErr || !created?.user?.id) {
      const msg = authErr?.message ?? "Could not create auth account";
      const exists =
        /already|registered|exists/i.test(msg) || authErr?.code === "email_exists" || authErr?.status === 422;
      if (exists) {
        return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
      }
      console.error("[register] Supabase createUser failed", authErr);
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    try {
      await prisma.user.create({
        data: {
          email,
          name: name || null,
          supabaseAuthId: created.user.id,
          role: "BOARD_MEMBER",
        },
      });
    } catch (err) {
      console.error("[register] Prisma user create failed after Supabase user created", err);
      try {
        await admin.auth.admin.deleteUser(created.user.id);
      } catch {
        /* best-effort rollback */
      }
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        return NextResponse.json(
          { error: "An account with this email or profile already exists" },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { error: "Could not finish registration. Try again or contact support." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[register] unhandled error", err);
    return NextResponse.json(
      {
        error: "Registration could not be completed. Please try again.",
        ...(process.env.NODE_ENV === "development" && err instanceof Error
          ? { details: [err.message] }
          : {}),
      },
      { status: 500 },
    );
  }
}
