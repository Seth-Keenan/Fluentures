// app/lib/actions/aiWordlistRecommendations.ts
"use server";

import { generateGeminiContent } from "@/app/lib/util/gemini";
import type { WordItem } from "@/app/types/wordlist";
import type {
  AiWordlistResponse,
  AiSuggestion,
} from "@/app/types/aiWordlistRecommendations";


function cleanGeminiJson(aiRaw: string): string {
  // 1) Strip code fences
  let cleaned = aiRaw.replace(/```json|```/g, "").trim();

  // 2) Slice to the JSON portion
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("AI response did not contain a JSON object");
  }

  cleaned = cleaned.slice(firstBrace, lastBrace + 1).trim();

  // 2.5) Drop obviously non-JSON lines (like stray commentary)
  cleaned = cleaned
    .split("\n")
    .filter((line) => {
      const t = line.trim();
      if (!t) return false;

      // Structural lines
      if (t === "{" || t === "}" || t === "[" || t === "]," || t === "],")
        return true;
      if (
        t.startsWith("{") ||
        t.startsWith("}") ||
        t.startsWith("[") ||
        t.startsWith("]")
      ) {
        return true;
      }
      // Property lines like: "reason": "..."
      if (t.startsWith('"') && t.includes('":')) return true;
      // Closing entries
      if (t === "}," || t === "}" || t === "],") return true;

      // Everything else (like stray theme commentary) is dropped
      return false;
    })
    .join("\n");

  // 3) Fix comma / brace issues

  // Insert missing commas between adjacent objects in arrays
  cleaned = cleaned.replace(/}\s*\n\s*{/g, "},\n{");

  // Normalize weird `},   {` variants
  cleaned = cleaned.replace(/}\s*,\s*{/g, "},\n{");

  // Remove trailing commas before } or ]
  cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");

  return cleaned;
}

// AI Suggestion & Fix
export async function getAiWordlistHelp(params: {
  language: string;
  items: WordItem[];
}): Promise<{ ok: true; data: AiWordlistResponse } | { ok: false; error: string }> {
  try {
    const { language, items } = params;

    const json = JSON.stringify(
      items.map((i) => ({
        target: i.target,
        english: i.english,
        notes: i.notes ?? "",
      }))
    );

    const prompt = `
You are helping users learn vocabulary for the language: ${language}.

Existing words:
${json}

Your tasks:
1. Infer the theme (if any).
2. Suggest 5–10 new words that match the theme, level, and relevance.
3. Identify incorrect target/english pairs (example: "Pig: Hola").
4. Provide corrected pairs when needed.

Return ONLY valid JSON with this shape (no extra fields, no comments, no trailing commas):
{
  "suggestions": [
    {
      "target": "string",
      "english": "string",
      "notes": "string | null",
      "reason": "string"
    }
  ],
  "corrections": [
    {
      "originalTarget": "string",
      "correctedTarget": "string",
      "english": "string",
      "explanation": "string"
    }
  ]
}
`;

    const aiRaw = await generateGeminiContent(prompt);
    const cleaned = cleanGeminiJson(aiRaw);

    let data: AiWordlistResponse;
    try {
      data = JSON.parse(cleaned) as AiWordlistResponse;
    } catch (parseErr) {
      console.error("Failed to parse Gemini JSON (wordlistHelp):", {
        aiRaw,
        cleaned,
        parseErr,
      });
      throw new Error("AI returned malformed JSON");
    }

    if (!Array.isArray(data.suggestions)) data.suggestions = [];
    if (!Array.isArray(data.corrections)) data.corrections = [];

    return { ok: true, data };
  } catch (err: unknown) {
    console.error("AI wordlist error:", err);
    const message = err instanceof Error ? err.message : "Unknown Gemini error";
    return { ok: false, error: message };
  }
}

// User typed suggestion
export async function getAiThemeSuggestions(params: {
  language: string;
  theme: string;
}): Promise<
  | { ok: true; data: { suggestions: AiSuggestion[] } }
  | { ok: false; error: string }
> {
  try {
    const { language, theme } = params;

    const prompt = `
You are helping users learn vocabulary for the language: ${language}.

The user is creating a themed word list (an "oasis") with the theme: "${theme}".

Your task:
- Suggest 10–15 useful ${language} words or short phrases that are clearly related to this theme.
- Focus on everyday, high-utility vocabulary for learners.

Return ONLY valid JSON with this shape (no extra fields, no comments, no trailing commas):
{
  "suggestions": [
    {
      "target": "string",          // word or phrase in ${language}
      "english": "string",         // English meaning
      "notes": "string | null",    // short hint (e.g., part of speech, usage)
      "reason": "string"           // why this word is useful for this theme
    }
  ]
}
`;

    const aiRaw = await generateGeminiContent(prompt);
    const cleaned = cleanGeminiJson(aiRaw);

    type ThemeResponse = { suggestions?: AiSuggestion[] };

    let parsed: ThemeResponse;
    try {
      parsed = JSON.parse(cleaned) as ThemeResponse;
    } catch (parseErr) {
      console.error("Failed to parse Gemini JSON (themeSuggestions):", {
        aiRaw,
        cleaned,
        parseErr,
      });
      throw new Error("AI returned malformed JSON for theme suggestions");
    }

    const suggestions = Array.isArray(parsed.suggestions)
      ? parsed.suggestions
      : [];

    return { ok: true, data: { suggestions } };
  } catch (err: unknown) {
    console.error("AI theme suggestions error:", err);
    const message = err instanceof Error ? err.message : "Unknown Gemini error";
    return { ok: false, error: message };
  }
}
