import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/supabase/env";
import { logServiceRoleEnvOnce } from "@/lib/supabase/log-service-role-debug";

export const dynamic = "force-dynamic";

/**
 * Operator diagnostics — no secrets returned. Unauthenticated by design for Vercel smoke tests;
 * restrict with Vercel Deployment Protection or a firewall if needed.
 *
 * `query` probes optional `public.todos` only — it does not validate Supabase Auth cookies or JWTs.
 */
export async function GET() {
  const url = getSupabaseUrl();
  const anon = getSupabaseAnonKey();
  const service = getSupabaseServiceRoleKey();
  logServiceRoleEnvOnce();
  const configured = isSupabaseConfigured();

  let host: string | null = null;
  try {
    if (url) host = new URL(url).host;
  } catch {
    host = null;
  }

  const payload = {
    ok: configured,
    timestamp: new Date().toISOString(),
    environment: {
      nextPublicSupabaseUrl: Boolean(url),
      nextPublicSupabaseAnonKey: Boolean(anon),
      supabaseServiceRoleKey: Boolean(service),
      urlHost: host,
    },
    query: null as
      | {
          attempted: boolean;
          usedServiceRole: boolean;
          success: boolean;
          hint?: string;
          postgresCode?: string;
        }
      | null,
  };

  if (!configured) {
    payload.query = {
      attempted: false,
      usedServiceRole: false,
      success: false,
      hint: "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel (and redeploy).",
    };
    return NextResponse.json(payload);
  }

  const key = service ?? anon!;
  const client = createClient(url!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await client.from("todos").select("id").limit(1);

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[api/supabase/health] query error:", error.message, error.code);
    }
    /** PGRST205 = table not in schema cache (missing or invisible) — keys are still fine for Auth. */
    const optionalTodosMissing =
      error.code === "PGRST205" ||
      error.message?.includes("schema cache") ||
      error.message?.includes("does not exist");

    if (optionalTodosMissing) {
      payload.query = {
        attempted: true,
        usedServiceRole: Boolean(service),
        success: true,
        postgresCode: error.code,
        hint:
          "Supabase API keys work. Optional `public.todos` table is missing — add it (.env.example SQL) or ignore; this does not affect Auth.",
      };
      return NextResponse.json(payload, { status: 200 });
    }

    payload.query = {
      attempted: true,
      usedServiceRole: Boolean(service),
      success: false,
      postgresCode: error.code,
      hint: service
        ? "Query failed with service role — check Supabase project status or RLS."
        : "Anon query failed — often RLS or wrong key. Add SUPABASE_SERVICE_ROLE_KEY for server checks (never expose to client).",
    };
    return NextResponse.json(payload, { status: 200 });
  }

  payload.query = {
    attempted: true,
    usedServiceRole: Boolean(service),
    success: true,
    hint: service
      ? "Service role can read `todos`."
      : "Anon key can read `todos` (verify RLS policies match your security model).",
  };
  return NextResponse.json(payload);
}
