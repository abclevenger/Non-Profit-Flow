import { NextResponse } from "next/server";
import { getAppAuth } from "@/lib/auth/get-app-auth";

export const dynamic = "force-dynamic";

/** Returns full app session JSON for the Supabase-authenticated user (or `{ user: null }`). */
export async function GET() {
  const session = await getAppAuth();
  if (!session) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json(session);
}
