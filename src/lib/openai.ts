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

export type NpAssessmentAiSummaryResult = {
  strongestCategories: string;
  needsAttention: string;
  essentialFirst: string;
};

/**
 * Nonprofit organizational assessment — concise executive narrative from scored JSON only.
 */
export async function generateNpAssessmentSummary(payload: unknown): Promise<NpAssessmentAiSummaryResult> {
  const openai = getOpenAIClient();

  const completion = await openai.chat.completions.create({
    model: MODEL,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a nonprofit governance advisor. Given ONLY the JSON assessment summary (category counts, flagged essential items), write three short plain-language paragraphs for executives. No legal advice. Output valid JSON:
{
  "strongestCategories": "string, 2-4 sentences: which thematic areas look strongest and why (use Met counts).",
  "needsAttention": "string, 2-4 sentences: which areas need attention (Needs Work, Don't Know, N/A volume).",
  "essentialFirst": "string, 2-4 sentences: which Essential-rated flagged items to address first and why."
}
Be specific to the data. If a list is empty, say what is unknown and suggest completing the assessment.`,
      },
      {
        role: "user",
        content: JSON.stringify(payload),
      },
    ],
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error("OpenAI returned an empty response");

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("OpenAI returned invalid JSON");
  }

  const o = parsed as Partial<NpAssessmentAiSummaryResult>;
  return {
    strongestCategories:
      typeof o.strongestCategories === "string" ? o.strongestCategories : "Unable to summarize strengths.",
    needsAttention: typeof o.needsAttention === "string" ? o.needsAttention : "Unable to summarize gaps.",
    essentialFirst: typeof o.essentialFirst === "string" ? o.essentialFirst : "Unable to prioritize essentials.",
  };
}

export type GovernanceAiMode = "explain" | "next" | "policy_draft";

export type GovernanceAiInput = {
  mode: GovernanceAiMode;
  pillarLabel: string;
  pillarSummary: string;
  organizationName?: string;
  missionSnippet?: string;
  questionText?: string;
  indicatorCode?: string;
  responseLabel?: string;
  ratingLabel?: string;
};

/**
 * Turns weak assessment signals into governance actions — not legal advice; original drafting only.
 */
export async function generateGovernanceAssistantReply(input: GovernanceAiInput): Promise<{ text: string }> {
  const openai = getOpenAIClient();

  const modeHint =
    input.mode === "explain"
      ? "Explain in plain language why this gap matters for nonprofit governance and what 'good' typically looks like. 2 short paragraphs max."
      : input.mode === "next"
        ? "List 5–7 concrete next steps (who should act, what artifact to produce, rough sequence). Bullet list. Not legal advice."
        : "Draft a concise policy OUTLINE (sections + bullet intent only) the organization could adapt with counsel — no statutory citations, no copying external text.";

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: `You assist nonprofit boards with governance operations. ${modeHint} Do not claim to quote the National Council of Nonprofits or any third party. Do not provide legal advice. If information is missing, state assumptions briefly.`,
      },
      {
        role: "user",
        content: JSON.stringify({
          organizationName: input.organizationName,
          missionSnippet: input.missionSnippet,
          pillar: input.pillarLabel,
          pillarContext: input.pillarSummary,
          indicatorCode: input.indicatorCode,
          practice: input.questionText,
          selfAssessmentResponse: input.responseLabel,
          priorityTier: input.ratingLabel,
        }),
      },
    ],
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("OpenAI returned an empty response");
  return { text };
}