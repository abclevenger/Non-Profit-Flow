import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validatePasswordStrength } from "@/lib/password-policy";
import { createServiceRoleSupabaseClient, isServiceRoleConfigured } from "@/lib/supabase/admin";

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
    return NextResponse.json(
      { error: "Password does not meet requirements", details: strength.errors },
      { status: 400 },
    );
  }
  if (!isServiceRoleConfigured()) {
    return NextResponse.json(
      {
        error:
          "Registration requires SUPABASE_SERVICE_ROLE_KEY on the server. Ask your administrator to configure auth.",
      },
      { status: 503 },
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
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
    return NextResponse.json({ error: "Could not finish registration. Try again or contact support." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
