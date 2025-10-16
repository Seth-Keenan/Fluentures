import { NextRequest, NextResponse } from "next/server";
import { generateGeminiContent, getInstruction } from "@/app/lib/util/gemini";
import { getUserSettingsFromRoute } from "@/app/login/server/getUserSettings";
import { getSupabaseServerRouteClient } from "@/app/lib/hooks/supabaseServerRouteClient";

type QuizBody = { listId?: string; word?: string; language?: string };

async function buildVocabHint(listId?: string) {
  if (!listId) return "";
  const supabase = await getSupabaseServerRouteClient();
  // Adjust column names if yours differ:
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
  return pairs.length ? `Use these vocabulary items where natural: ${pairs.join(", ")}.` : "";
}

export async function POST(req: NextRequest) {
  let body: QuizBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
  }

  const word = typeof body.word === "string" ? body.word.trim() : "";
  if (!word) {
    return NextResponse.json({ error: "Missing required field: word" }, { status: 400 });
  }

  try {
    // Settings (route-safe)
    const { settings } = await getUserSettingsFromRoute();
    const language = body.language ?? settings.language ?? "Japanese";
    const difficulty = settings.difficulty ?? "Beginner";

    // Optional bias from this oasis’ vocab
    const vocabHint = await buildVocabHint(body.listId);

    const instruction = getInstruction(difficulty);
    const prompt = [
      `In ${language}, create a natural, commonly used sentence that contains the word "${word}".`,
      instruction,
      `Replace the target word with a blank (______).`,
      `No translations or explanations. No formatting.`,
      vocabHint && `[Vocabulary bias] ${vocabHint}`,
      body.listId && `Oasis/List ID: ${body.listId}`,
    ].filter(Boolean).join("\n");

    const sentence = await generateGeminiContent(prompt, 120);
    return NextResponse.json({ sentence, usedSettings: { language, difficulty } });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("❌ Quiz sentence generation error:", err);
    return NextResponse.json({ error: "Failed to generate quiz sentence" }, { status: 500 });
  }
}
