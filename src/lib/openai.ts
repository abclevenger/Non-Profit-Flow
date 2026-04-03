import "server-only";

import OpenAI from "openai";

const MODEL = "gpt-4o-mini";

let client: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key?.trim()) {
    throw new Error("Missing OPENAI_API_KEY");
  }
  if (!client) {
    client = new OpenAI({ apiKey: key });
  }
  return client;
}

export type AgendaDeadline = { label: string; date: string };

export type GenerateAgendaInput = {
  pastAgendaItems: string[];
  pendingDecisions: string[];
  deadlines: AgendaDeadline[];
};

export type AgendaItemDraft = {
  title: string;
  kind: "decision" | "discussion" | "information" | "consent" | "other";
  rationale: string;
  urgency: "high" | "medium" | "low";
  suggestedOrder: number;
};

export type AgendaDraftResult = {
  summary: string;
  items: AgendaItemDraft[];
};

/**
 * Server-only: calls OpenAI to produce a structured agenda draft from context.
 * Never import this module from Client Components.
 */
export async function generateAgenda(input: GenerateAgendaInput): Promise<AgendaDraftResult> {
  const openai = getOpenAIClient();

  const userPayload = {
    pastAgendaItems: input.pastAgendaItems,
    pendingDecisions: input.pendingDecisions,
    deadlines: input.deadlines,
  };

  const completion = await openai.chat.completions.create({
    model: MODEL,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a nonprofit board meeting planner. Output valid JSON only, matching this shape:
{
  "summary": "string, one short paragraph",
  "items": [
    {
      "title": "string",
      "kind": "decision" | "discussion" | "information" | "consent" | "other",
      "rationale": "string, one sentence",
      "urgency": "high" | "medium" | "low",
      "suggestedOrder": number (1-based sort order, urgent first)
    }
  ]
}
Prioritize by urgency, regulatory/grant deadlines, and open votes. Keep titles concise.`,
      },
      {
        role: "user",
        content: `Produce a draft board agenda from this JSON context:\n${JSON.stringify(userPayload, null, 2)}`,
      },
    ],
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) {
    throw new Error("OpenAI returned an empty response");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("OpenAI returned invalid JSON");
  }

  const result = parsed as Partial<AgendaDraftResult>;
  if (typeof result.summary !== "string" || !Array.isArray(result.items)) {
    throw new Error("OpenAI response did not match expected agenda shape");
  }

  return {
    summary: result.summary,
    items: result.items.map((item, i) => ({
      title: typeof item.title === "string" ? item.title : `Item ${i + 1}`,
      kind: normalizeKind(item.kind),
      rationale: typeof item.rationale === "string" ? item.rationale : "",
      urgency: normalizeUrgency(item.urgency),
      suggestedOrder: typeof item.suggestedOrder === "number" ? item.suggestedOrder : i + 1,
    })),
  };
}

function normalizeKind(
  value: unknown,
): "decision" | "discussion" | "information" | "consent" | "other" {
  const k = typeof value === "string" ? value.toLowerCase() : "";
  if (k === "decision" || k === "discussion" || k === "information" || k === "consent" || k === "other") {
    return k;
  }
  return "other";
}

function normalizeUrgency(value: unknown): "high" | "medium" | "low" {
  const u = typeof value === "string" ? value.toLowerCase() : "";
  if (u === "high" || u === "medium" || u === "low") return u;
  return "medium";
}