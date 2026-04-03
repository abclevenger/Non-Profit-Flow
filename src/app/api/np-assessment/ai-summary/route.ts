import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { generateNpAssessmentSummary } from "@/lib/openai";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  payload: z.unknown(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  try {
    const summary = await generateNpAssessmentSummary(parsed.data.payload);
    return NextResponse.json(summary);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Summary failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
