import { z } from "zod";
import type { AssistantInsight, LibrarySummary } from "@/lib/assistant/scoring";

export type AssistantAiInput = {
  userLibrarySummary: LibrarySummary;
  candidate?: {
    title: string;
    status?: string;
    price?: string;
    genres?: string[];
    platforms?: string[];
    reasonUserWantsIt?: string;
  };
  ruleInsights: AssistantInsight[];
};

export type AssistantAiOutput = {
  headline: string;
  explanation: string;
  nextQuestion?: string;
  actionLabel: string;
  caveats: string[];
};

const AssistantAiOutputSchema = z.object({
  headline: z.string().min(1),
  explanation: z.string().min(1),
  nextQuestion: z.string().optional(),
  actionLabel: z.string().min(1),
  caveats: z.array(z.string()).default([]),
});

function getOpenAiConfig() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  return {
    apiKey,
    model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
  };
}

function extractOutputText(response: unknown) {
  if (!response || typeof response !== "object") {
    return null;
  }

  const maybeText = (response as { output_text?: unknown }).output_text;
  if (typeof maybeText === "string") {
    return maybeText;
  }

  const output = (response as { output?: unknown }).output;
  if (!Array.isArray(output)) {
    return null;
  }

  for (const item of output) {
    if (!item || typeof item !== "object") {
      continue;
    }
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) {
      continue;
    }
    for (const contentItem of content) {
      if (!contentItem || typeof contentItem !== "object") {
        continue;
      }
      const text = (contentItem as { text?: unknown }).text;
      if (typeof text === "string") {
        return text;
      }
    }
  }

  return null;
}

export function buildFallbackAssistantSummary(input: AssistantAiInput): AssistantAiOutput {
  const topInsight = input.ruleInsights[0];
  if (!topInsight) {
    return {
      headline: "No backlog pressure detected",
      explanation: "There is not enough activity yet to produce a useful diagnosis.",
      actionLabel: "Sync or import more games",
      caveats: ["Steam and CSV data quality affect assistant accuracy."],
    };
  }

  return {
    headline: "Your backlog needs a smaller next step",
    explanation: topInsight.reasons.map((reason) => reason.evidence).join(" "),
    nextQuestion: "Was the blocker time, mood, difficulty, or another game pulling you away?",
    actionLabel: topInsight.suggestedAction,
    caveats: ["This is based on library signals, not a judgment of taste."],
  };
}

export async function summarizeAssistantInsights(
  input: AssistantAiInput,
): Promise<{ output: AssistantAiOutput; model: string | null; usedAi: boolean }> {
  const config = getOpenAiConfig();
  if (!config) {
    return {
      output: buildFallbackAssistantSummary(input),
      model: null,
      usedAi: false,
    };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        input: [
          {
            role: "system",
            content:
              "You are a calm game-library decision assistant. Return concise JSON only. Avoid guilt language.",
          },
          {
            role: "user",
            content: JSON.stringify(input),
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "assistant_ai_output",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                headline: { type: "string" },
                explanation: { type: "string" },
                nextQuestion: { type: "string" },
                actionLabel: { type: "string" },
                caveats: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: [
                "headline",
                "explanation",
                "nextQuestion",
                "actionLabel",
                "caveats",
              ],
            },
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed with ${response.status}.`);
    }

    const json = await response.json();
    const outputText = extractOutputText(json);
    if (!outputText) {
      throw new Error("OpenAI response did not include output text.");
    }

    return {
      output: AssistantAiOutputSchema.parse(JSON.parse(outputText)),
      model: config.model,
      usedAi: true,
    };
  } catch {
    return {
      output: buildFallbackAssistantSummary(input),
      model: config.model,
      usedAi: false,
    };
  }
}
