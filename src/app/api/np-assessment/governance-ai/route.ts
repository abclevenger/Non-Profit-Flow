import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { generateGovernanceAssistantReply, type GovernanceAiMode } from "@/lib/openai";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  mode: z.enum(["explain", "next", "policy_draft"]),
  pillarLabel: z.string().min(1),
  pillarSummary: z.string().min(1),
  organizationName: z.string().optional(),
  missionSnippet: z.string().optional(),
  questionText: z.string().optional(),
  indicatorCode: z.string().optional(),
  responseLabel: z.string().optional(),
  ratingLabel: z.string().optional(),
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
    return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const payload = parsed.data;
    const { text } = await generateGovernanceAssistantReply({
      mode: payload.mode as GovernanceAiMode,
      pillarLabel: payload.pillarLabel,
      pillarSummary: payload.pillarSummary,
      organizationName: payload.organizationName,
      missionSnippet: payload.missionSnippet,
      questionText: payload.questionText,
      indicatorCode: payload.indicatorCode,
      responseLabel: payload.responseLabel,
      ratingLabel: payload.ratingLabel,
    });
    return NextResponse.json({ text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Assistant failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
