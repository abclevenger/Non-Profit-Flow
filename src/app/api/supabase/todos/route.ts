import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createServiceRoleSupabaseClient, isServiceRoleConfigured } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return { session: null };
  }
  return { session };
}

export async function GET() {
  const { session } = await requireUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  if (isServiceRoleConfigured()) {
    try {
      const admin = createServiceRoleSupabaseClient("api/supabase/todos GET");
      const { data, error } = await admin.from("todos").select("id, name, created_at").order("created_at", {
        ascending: false,
      });
      if (error) {
        console.error("[api/supabase/todos] GET service role:", error.message);
        return NextResponse.json({ error: error.message, code: error.code }, { status: 502 });
      }
      return NextResponse.json({ items: data ?? [], mode: "service_role" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Server error";
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }

  const cookieStore = await cookies();
  const supabase = createServerSupabaseClient(cookieStore);
  const { data, error } = await supabase.from("todos").select("id, name, created_at").order("created_at", {
    ascending: false,
  });
  if (error) {
    console.error("[api/supabase/todos] GET anon:", error.message);
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        hint: "If this is RLS, add SUPABASE_SERVICE_ROLE_KEY for trusted server reads after session checks, or use Supabase Auth JWTs with RLS policies.",
      },
      { status: 502 },
    );
  }
  return NextResponse.json({ items: data ?? [], mode: "anon_cookie" });
}

export async function POST(req: Request) {
  const { session } = await requireUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }
  if (!isServiceRoleConfigured()) {
    return NextResponse.json(
      {
        error: "Server inserts require SUPABASE_SERVICE_ROLE_KEY (Vercel env, server-only).",
        hint: "POST uses the service role; without it, anon clients hit RLS unless policies allow writes.",
      },
      { status: 501 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const name = typeof body === "object" && body && "name" in body ? String((body as { name: unknown }).name).trim() : "";
  if (!name || name.length > 500) {
    return NextResponse.json({ error: "name is required (max 500 chars)" }, { status: 400 });
  }

  try {
    const admin = createServiceRoleSupabaseClient("api/supabase/todos POST");
    const { data, error } = await admin.from("todos").insert({ name }).select("id, name, created_at").single();
    if (error) {
      console.error("[api/supabase/todos] POST:", error.message);
      return NextResponse.json({ error: error.message, code: error.code }, { status: 502 });
    }
    return NextResponse.json({ item: data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
