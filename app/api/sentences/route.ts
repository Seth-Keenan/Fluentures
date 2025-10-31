import { NextRequest, NextResponse } from "next/server";
import type { Content } from "@google/generative-ai";
import { generateGeminiContent, getInstruction, sendGeminiChat } from "@/app/lib/util/gemini";
import { getUserSettingsFromRoute } from "@/app/login/server/getUserSettings";
import { getSupabaseServerRouteClient } from "@/app/lib/hooks/supabaseServerRouteClient";

// Types
type SentencesBody = {
  action?: "generate" | "chat";
  listId?: string;
  language?: string;
  word?: string;
  input?: string;
  history?: Content[];
};

type Settings = { language: string; difficulty: string };

// Small helpers
function badRequest(msg: string) {
  return NextResponse.json({ error: msg }, { status: 400 });
}

async function parseBody(req: NextRequest): Promise<SentencesBody | NextResponse> {
  try {
    return await req.json();
  } catch {
    return badRequest("Invalid JSON format");
  }
}

async function getResolvedSettings(body: SentencesBody): Promise<Settings> {
  const { settings } = await getUserSettingsFromRoute();
  return {
    language: body.language ?? settings.language ?? "Japanese",
    difficulty: settings.difficulty ?? "Beginner",
  };
}

// Build a soft vocabulary bias string from a list (for chat only)
async function buildVocabHint(listId?: string): Promise<string> {
  if (!listId) return "";
  const supabase = await getSupabaseServerRouteClient();
  const { data: words, error } = await supabase
    .from("Word")
    .select("word_target, word_english")
    .eq("word_list_id", listId)
    .limit(50);

  if (error || !words?.length) return "";

  const pairs = words
    .filter(w => w.word_target || w.word_english)
    .map(w => `${w.word_target ?? ""} = ${w.word_english ?? ""}`)
    .slice(0, 25);

  return pairs.length ? `Vocabulary in this course (for context only): ${pairs.join(", ")}.` : "";
}

async function handleGenerate(body: SentencesBody, s: Settings /* no vocabHint here */) {
  const word = (body.word ?? "").trim();
  if (!word) return badRequest("Missing required field: word");

  const instruction = getInstruction(s.difficulty);


  const prompt = [
    `Write exactly ONE natural sentence in ${s.language}.`,
    `It MUST correctly use the target word: "${word}".`,
    `Do NOT include any other vocabulary from the user's word list.`,
    `No explanations, no translation, no formatting; return only the sentence.`,
    instruction, // your difficulty guidance
  ].join("\n");

  const sentence = await generateGeminiContent(prompt);
  return NextResponse.json({ sentence, usedSettings: s });
}

async function handleChat(body: SentencesBody, s: Settings, vocabHint: string) {
  const input = (body.input ?? "").trim();
  const history: Content[] = Array.isArray(body.history) ? body.history : [];
  if (!input || history.length === 0) return badRequest("Missing chat input or history");

  // Keep a soft bias for chat, but make it explicit it's "context only"
  const context = [
    `Answer in ${s.language}. Difficulty: ${s.difficulty}.`,
    `Be concise. No formatting.`,
    `Answer primarily in English`,
    vocabHint && `Use the following vocabulary ONLY when it fits naturally; do not force it: ${vocabHint}`,
    body.listId && `This chat belongs to Oasis/List ID: ${body.listId}.`,
  ]
    .filter(Boolean)
    .join(" ");

  const reply = await sendGeminiChat(input, history, context);
  return NextResponse.json({ reply, usedSettings: s });
}

// POST
export async function POST(req: NextRequest) {
  const parsed = await parseBody(req);
  if (parsed instanceof NextResponse) return parsed;
  const body = parsed;

  try {
    const settings = await getResolvedSettings(body);

    // FIX: Only compute vocab hint for chat so generate doesn't get biased
    const vocabHint = body.action === "chat" ? await buildVocabHint(body.listId) : "";

    switch (body.action) {
      case "generate":
        return await handleGenerate(body, settings);
      case "chat":
        return await handleChat(body, settings, vocabHint);
      default:
        return badRequest("Invalid request body");
    }
  } catch (err) {
    console.error("❌ /api/sentences error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
