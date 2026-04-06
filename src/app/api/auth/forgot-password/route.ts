import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getPasswordRecoveryRedirectTo } from "@/lib/auth/password-recovery-redirect";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

const GENERIC_OK_MESSAGE =
  "If an account exists for this email, you will receive password reset instructions shortly.";

/**
 * Supabase Auth password recovery (email link → `/auth/callback` → `/reset-password`).
 * Same response whether or not the email is registered (no account enumeration).
 */
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

  const url = getSupabaseUrl();
  const anon = getSupabaseAnonKey();
  if (!url || !anon) {
    return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 });
  }

  const redirectTo = getPasswordRecoveryRedirectTo();

  const sb = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo });

  if (error) {
    console.error("[forgot-password] resetPasswordForEmail", error.message, {
      redirectHost: (() => {
        try {
          return new URL(redirectTo).host;
        } catch {
          return "invalid-redirectTo";
        }
      })(),
    });
    /* Still return generic message — do not leak Supabase errors to clients. */
  } else if (process.env.NODE_ENV === "development") {
    console.info("[forgot-password] redirectTo (dev)", redirectTo);
  }

  return NextResponse.json({
    ok: true,
    message: GENERIC_OK_MESSAGE,
  });
}
