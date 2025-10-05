// app/lib/util/gemini.ts
import { GoogleGenerativeAI, Content } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export function getGeminiModel(model: string = "gemini-2.5-flash") {
  return genAI.getGenerativeModel({ model });
}

// pick the new generation models
const PRIMARY_MODEL = "gemini-2.5-flash";   
const FALLBACK_MODEL = "gemini-2.5-pro";   

// -------------------- retry utils --------------------
const MAX_BACKOFF_MS = 2000;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

type GeminiMeta = {
  status?: number;
  retryAfterSec?: number;
  isDailyQuota?: boolean;
  quotaId?: string;
  quotaMetric?: string;
};

function extractMeta(err: unknown): GeminiMeta {
  const errObj = err as Record<string, unknown>;
  let status: number | undefined;
  if (typeof errObj?.status === "number") {
    status = errObj.status as number;
  } else if (typeof (errObj?.response as Record<string, unknown>)?.status === "number") {
    status = (errObj.response as Record<string, unknown>).status as number;
  } else {
    status = undefined;
  }

  // google.rpc style details sometimes included on the thrown error
  const details = errObj?.errorDetails;
  const meta: GeminiMeta = { status };

  if (Array.isArray(details)) {
    for (const d of details) {
      const type = d?.["@type"];
      if (type?.includes("google.rpc.RetryInfo")) {
        const retryDelay = d?.retryDelay; // e.g., "52s"
        const sec = typeof retryDelay === "string" && retryDelay.endsWith("s")
          ? parseFloat(retryDelay.slice(0, -1))
          : undefined;
        if (Number.isFinite(sec)) meta.retryAfterSec = sec;
      }
      if (type?.includes("google.rpc.QuotaFailure")) {
        const v = d?.violations?.[0];
        if (v) {
          meta.quotaId = v.quotaId;
          meta.quotaMetric = v.quotaMetric;
          // Heuristic: daily free-tier quota id often contains "PerDay" or "FreeTier"
          const id = String(v.quotaId || "").toLowerCase();
          if (id.includes("perday") || id.includes("freetier")) {
            meta.isDailyQuota = true;
          }
        }
      }
    }
  }
  return meta;
}

function isRetryable(err: unknown): boolean {
  const { status, isDailyQuota } = extractMeta(err);
  if (status === 503) return true;                  // overloaded
  if (status === 429 && !isDailyQuota) return true; // burst rate-limit is retryable
  // network hiccups
  const msg = String((err as Error)?.message || "").toLowerCase();
  if (msg.includes("fetch failed") || msg.includes("network")) return true;
  return false;
}

async function withRetry<T>(
  fn: () => Promise<T>,
  { retries = 3, baseMs = 400 }: { retries?: number; baseMs?: number } = {}
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastErr = err;
      const meta = extractMeta(err);

      // Do not retry on daily quota exhaustion
      if (meta.status === 429 && meta.isDailyQuota) break;

      if (!isRetryable(err) || attempt === retries) break;

      // Respect Retry-After when short; otherwise do bounded backoff
      const waitMs = meta.retryAfterSec
        ? Math.min(meta.retryAfterSec * 1000, MAX_BACKOFF_MS)
        : Math.min(baseMs * 2 ** attempt, MAX_BACKOFF_MS);

      const jitter = Math.random() * 150;
      await sleep(waitMs + jitter);
    }
  }
  throw lastErr;
}

// -------------------- difficulty → instruction --------------------
export function getInstruction(difficulty: string): string {
  switch (difficulty) {
    case "Beginner":
      return "Use very simple vocabulary and sentence structures.";
    case "Intermediate":
      return "Use moderately complex vocabulary and grammar.";
    case "Advanced":
      return "Use natural and idiomatic expressions with some advanced grammar.";
    default:
      return "Use clear and natural expressions.";
  }
}

// -------------------- content generation (retry + fallback) --------------------
export async function generateGeminiContent(prompt: string, maxTokens = 2048) {
  const request = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.9,
      topK: 2,
      topP: 1,
      maxOutputTokens: maxTokens,
    },
  };

  try {
    const result = await withRetry(() =>
      getGeminiModel(PRIMARY_MODEL).generateContent(request)
    );
    return result.response.text();
  } catch (primaryErr: unknown) {
    // Try fallback model too (its quota may differ)
    try {
      const result = await withRetry(
        () => getGeminiModel(FALLBACK_MODEL).generateContent(request),
        { retries: 2, baseMs: 500 }
      );
      return result.response.text();
    } catch {
      // Attach status/Retry-After for routes to use
      const meta = extractMeta(primaryErr);
      const errorWithMeta = primaryErr as Record<string, unknown>;
      errorWithMeta.status = meta.status ?? errorWithMeta.status;
      errorWithMeta.retryAfterSec = meta.retryAfterSec;
      errorWithMeta.isDailyQuota = meta.isDailyQuota;
      throw primaryErr;
    }
  }
}

// -------------------- chat (retry + fallback) --------------------
export async function sendGeminiChat(input: string, history: Content[], contextMessage: string) {
  const contents: Content[] = [
    ...history,
    { role: "user", parts: [{ text: `${contextMessage}\n\n${input}` }] },
  ];

  try {
    const result = await withRetry(() =>
      getGeminiModel(PRIMARY_MODEL).generateContent({ contents })
    );
    return result.response.text();
  } catch (primaryErr: unknown) {
    try {
      const result = await withRetry(
        () => getGeminiModel(FALLBACK_MODEL).generateContent({ contents }),
        { retries: 2, baseMs: 500 }
      );
      return result.response.text();
    } catch {
      const meta = extractMeta(primaryErr);
      const errorWithMeta = primaryErr as Record<string, unknown>;
      errorWithMeta.status = meta.status ?? errorWithMeta.status;
      errorWithMeta.retryAfterSec = meta.retryAfterSec;
      errorWithMeta.isDailyQuota = meta.isDailyQuota;
      throw primaryErr;
    }
  }
}
