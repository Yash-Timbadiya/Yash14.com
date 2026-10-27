import "server-only";

import type { PageCopy } from "@/features/roast/lib/page-copy";
import type {
  AiCategoryKey,
  RoastCategoryKey,
  RoastCheck,
  RoastResult,
} from "@/features/roast/types";

import { z } from "zod";
import { config } from "@/config";
import {
  AI_CATEGORIES,
  ROAST_CATEGORIES,
} from "@/features/roast/data/roast-content";
import {
  ROAST_SYSTEM_PROMPT,
  PRAISE_SYSTEM_PROMPT,
} from "@/features/roast/lib/roast-prompt";

// Free models are slow when busy, so each one gets a minute. The whole AI
// step is capped too, so retries can't push past the route's maxDuration.
const MODEL_TIMEOUT_MS = 60_000;
const AI_BUDGET_MS = 150_000;
// Free endpoints often answer 429 or 5xx once and succeed right after.
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const RETRY_DELAY_MS = 800;

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

// Loose on purpose: long lines are trimmed to whole sentences later. Empty
// means the model found no evidence for that section, which the prompt allows.
const roastLine = z.string().trim().max(1000).catch("");
const MAX_LINE_CHARS = 280;
// The verdict is a big pull quote that has to fit in three lines.
const MAX_VERDICT_CHARS = 180;

// Models send scores as numbers, numeric strings or null; anything else is
// treated as no score rather than failing the whole reply.
const aiScore = z.preprocess(
  (value) => (typeof value === "string" ? Number(value) : value),
  z.number().min(0).max(100).transform(Math.round).nullable().catch(null),
);

/**
 * A line per checked category and per AI-only section, the closing verdict,
 * and AI scores for the sections no check measures.
 */
const aiRoastSchema = z.object({
  speed: roastLine,
  seo: roastLine,
  copy: roastLine,
  social: roastLine,
  trust: roastLine,
  mobile: roastLine,
  design: roastLine,
  ux: roastLine,
  technical: roastLine,
  accessibility: roastLine,
  business: roastLine,
  originality: roastLine,
  wildcard: roastLine,
  verdict: z.string().trim().min(10).max(1000),
  scores: z
    .object({
      design: aiScore,
      ux: aiScore,
      technical: aiScore,
      accessibility: aiScore,
      business: aiScore,
      originality: aiScore,
      wildcard: aiScore,
    } satisfies Record<AiCategoryKey, typeof aiScore>)
    .partial()
    .catch({}),
} satisfies Record<
  RoastCategoryKey | AiCategoryKey | "verdict" | "scores",
  z.ZodTypeAny
>);

export type AiRoast = z.infer<typeof aiRoastSchema>;

export type AiRoastInput = {
  roast: RoastResult;
  checks: RoastCheck[];
  copy: PageCopy;
};

const OWNER_DOMAIN = new URL(config.app.url).hostname.replace(/^www\./, "");

export function isOwnerSite(domain: string) {
  return domain === OWNER_DOMAIN;
}

function buildUserPrompt({ roast, checks, copy }: AiRoastInput) {
  const categories = ROAST_CATEGORIES.map(({ key, label }) => ({
    key,
    label,
    score: roast.categories.find((c) => c.key === key)?.score ?? 0,
    checks: checks
      .filter((c) => c.category === key)
      .map((c) => `${c.status.toUpperCase()}: ${c.label} = ${c.value}`),
  }));

  const siteData = {
    domain: roast.domain,
    overallScore: roast.score,
    grade: roast.grade,
    lighthouse: roast.lighthouse,
    categories,
    copy,
  };

  const task = isOwnerSite(roast.domain)
    ? "Praise this website. Do not roast or criticize it."
    : "Roast this website.";
  return `${task}\n\n<site_data>\n${JSON.stringify(siteData, null, 2)}\n</site_data>`;
}

/** Pulls the first JSON object out of a reply, tolerating code fences. */
function parseAiRoast(text: string): AiRoast | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;

  try {
    const parsed = aiRoastSchema.safeParse(
      JSON.parse(text.slice(start, end + 1)),
    );
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

class OpenRouterError extends Error {
  constructor(readonly status: number) {
    super(`HTTP ${status}`);
  }
}

type OpenRouterResponse = {
  choices?: { message?: { content?: string | null } }[];
};

async function roastWithOpenRouter(
  apiKey: string,
  model: string,
  systemPrompt: string,
  prompt: string,
  signal: AbortSignal,
) {
  const response = await fetch(OPENROUTER_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": config.app.url,
      "X-Title": "Roast My Site",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      // With reasoning on, the free Nemotron models often take 45 s or more.
      reasoning: { enabled: false },
    }),
    signal: AbortSignal.any([signal, AbortSignal.timeout(MODEL_TIMEOUT_MS)]),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new OpenRouterError(response.status);
  }

  const data = (await response.json()) as OpenRouterResponse;
  return parseAiRoast(data.choices?.[0]?.message?.content ?? "");
}

/**
 * Personal roast lines written from the audit and the page's own words.
 * Tries each OpenRouter model in order, retrying a quick 429 or 5xx once.
 * Null means all of them failed, so
 * the caller keeps the prewritten lines. Never throws.
 */
export async function generateAiRoast(
  input: AiRoastInput,
  signal: AbortSignal,
): Promise<AiRoast | null> {
  const { apiKey, models } = config.roast.openrouter;
  if (!apiKey) return null;

  const prompt = buildUserPrompt(input);
  const systemPrompt = isOwnerSite(input.roast.domain)
    ? PRAISE_SYSTEM_PROMPT
    : ROAST_SYSTEM_PROMPT;
  const deadline = AbortSignal.any([signal, AbortSignal.timeout(AI_BUDGET_MS)]);

  for (const model of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      if (deadline.aborted) return null;
      try {
        const roast = await roastWithOpenRouter(
          apiKey,
          model,
          systemPrompt,
          prompt,
          deadline,
        );
        if (roast) return roast;
        console.warn(`[roast] ${model} gave no usable roast`);
        break;
      } catch (error) {
        // The message is enough; a logged DOMException dumps every error code.
        const reason = error instanceof Error ? error.message : String(error);
        console.warn(`[roast] ${model} failed: ${reason}`);
        // A timeout already spent this model's budget, so only fast errors retry.
        const retryable =
          error instanceof OpenRouterError &&
          RETRYABLE_STATUS.has(error.status);
        if (!retryable || attempt === 2) break;
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }
  return null;
}

/**
 * Models ignore the no-em-dash and length rules often enough to enforce them
 * here. Keeps whole sentences up to the limit, and always at least the first.
 */
function tidy(line: string, maxChars = MAX_LINE_CHARS) {
  const sentences = line
    .replace(/\s+[-—–]\s+|\s*[—–]\s*/g, ", ")
    .split(/(?<=[.!?])\s+/);

  let result = sentences[0];
  for (const sentence of sentences.slice(1)) {
    if (result.length + sentence.length + 1 > maxChars) break;
    result = `${result} ${sentence}`;
  }
  return result;
}

/**
 * Swaps in the AI's lines (a checked category it left empty keeps its
 * prewritten line) and adds each AI-only section that has both a line and a
 * score.
 */
export function applyAiRoast(roast: RoastResult, ai: AiRoast): RoastResult {
  const checked = roast.categories.map((category) => {
    const line = ai[category.key];
    return line ? { ...category, line: tidy(line) } : category;
  });

  const aiOnly = AI_CATEGORIES.flatMap(({ key, label }) => {
    const line = ai[key];
    const score = ai.scores[key];
    if (!line || score == null) return [];
    return [
      {
        key,
        label,
        score,
        line: tidy(line),
        aiScored: true,
        issues: [],
        passedCount: 0,
      },
    ];
  });

  return {
    ...roast,
    aiWritten: true,
    verdict: tidy(ai.verdict, MAX_VERDICT_CHARS),
    categories: [...aiOnly, ...checked],
  };
}
