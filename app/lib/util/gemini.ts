// app/lib/util/gemini.ts
import { GoogleGenerativeAI, Content } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Models
const PRIMARY_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-2.5-pro";

// ---- tiny model getter (replaces getGeminiModel) ----
function modelFor(model: string) {
  return genAI.getGenerativeModel({ model });
}

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
    status = errObj.status;
  } else if (typeof (errObj?.response as Record<string, unknown>)?.status === "number") {
    status = (errObj.response as Record<string, unknown>).status as number;
  } else {
    status = undefined;
  }

  const details = errObj?.errorDetails;
  const meta: GeminiMeta = { status };

  if (Array.isArray(details)) {
    for (const d of details) {
      const type = d?.["@type"];
      if (type?.includes("google.rpc.RetryInfo")) {
        const retryDelay = d?.retryDelay; // e.g., "52s"
        const sec =
          typeof retryDelay === "string" && retryDelay.endsWith("s")
            ? parseFloat(retryDelay.slice(0, -1))
            : undefined;
        if (Number.isFinite(sec)) meta.retryAfterSec = sec;
      }
      if (type?.includes("google.rpc.QuotaFailure")) {
        const v = d?.violations?.[0];
        if (v) {
          meta.quotaId = v.quotaId;
          meta.quotaMetric = v.quotaMetric;
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
  if (status === 503) return true;
  if (status === 429 && !isDailyQuota) return true;
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

      if (meta.status === 429 && meta.isDailyQuota) break;
      if (!isRetryable(err) || attempt === retries) break;

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

// -------------------- content generation (retry + fallback + nudge) --------------------
export async function generateGeminiContent(prompt: string) {
  const request = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.9,
      topK: 2,
      topP: 1,
      // maxOutputTokens: maxTokens,
    },
  };

  interface GeminiResponse {
    response?: {
      candidates?: Array<{
        finishReason?: string | null;
      }>;
    };
  }

  const getFinish = (res: GeminiResponse) =>
    (res?.response?.candidates ?? []).map((c) => c?.finishReason ?? null);

  // PRIMARY
  try {
    const result = await withRetry(() => modelFor(PRIMARY_MODEL).generateContent(request));
    const text = result.response.text();

    // Nudge retry if empty or non-STOP
    const finish = getFinish(result);
    const needsNudge = !text || finish.some((f: string | null) => f && f !== "STOP");
    if (needsNudge) {
      const nudgeRequest = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          topK: 2,
          topP: 1,
          // maxOutputTokens: Math.max(256, maxTokens),
          responseMimeType: "text/plain",
        },
      };
      const nudged = await withRetry(() => modelFor(PRIMARY_MODEL).generateContent(nudgeRequest));
      const nudgedText = nudged.response.text();
      if (nudgedText) return nudgedText;
      throw new Error("PRIMARY_EMPTY_AFTER_NUDGE");
    }

    return text;
  } catch (primaryErr: unknown) {

    // FALLBACK
    try {
      const fallbackReq = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.6,
          topK: 2,
          topP: 1,
          // maxOutputTokens: Math.max(256, maxTokens),
          responseMimeType: "text/plain",
        },
      };

      const result = await withRetry(
        () => modelFor(FALLBACK_MODEL).generateContent(fallbackReq),
        { retries: 2, baseMs: 500 }
      );

      const text = result.response.text();
      return text;
    } catch {
      const meta2 = extractMeta(primaryErr);
      const errorWithMeta = primaryErr as Record<string, unknown>;
      errorWithMeta.status = meta2.status ?? errorWithMeta.status;
      errorWithMeta.retryAfterSec = meta2.retryAfterSec;
      errorWithMeta.isDailyQuota = meta2.isDailyQuota;
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

  // PRIMARY
  try {
    const result = await withRetry(() => modelFor(PRIMARY_MODEL).generateContent({ contents }));
    const text = result.response.text();
    if (text) return text;

    // If empty, fall through to fallback (keep behaviour minimal)
    throw new Error("CHAT_PRIMARY_EMPTY");
  } catch (primaryErr: unknown) {

    // FALLBACK
    try {
      const result = await withRetry(
        () => modelFor(FALLBACK_MODEL).generateContent({ contents }),
        { retries: 2, baseMs: 500 }
      );
      const text = result.response.text();
      return text;
    } catch {
      const meta2 = extractMeta(primaryErr);
      const errorWithMeta = primaryErr as Record<string, unknown>;
      errorWithMeta.status = meta2.status ?? errorWithMeta.status;
      errorWithMeta.retryAfterSec = meta2.retryAfterSec;
      errorWithMeta.isDailyQuota = meta2.isDailyQuota;
      throw primaryErr;
    }
  }
}

/* Note on max tokens:
  Using them seems to cause a bug. No empty response and OK.
  https://github.com/google-gemini/deprecated-generative-ai-python/issues/280
*/
