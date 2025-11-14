// app/api/story/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateGeminiContent, getInstruction, sendGeminiChat } from "@/app/lib/util/gemini";
import { Content } from "@google/generative-ai";
import { getUserSettingsFromRoute } from "@/app/login/server/getUserSettings";
import { getSupabaseServerRouteClient } from "@/app/lib/hooks/supabaseServerRouteClient";

type StoryRequestBody = {
  mode?: "generate" | "chat";
  listId?: string;          // oasis/wordlist id
  language?: string;        // optional override
  vocabHint?: string;       // optional override
  input?: string;           // for chat
  history?: Content[];      // for chat
};

export async function POST(req: NextRequest) {
  let body: StoryRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
  }

  try {
    // User settings fallback
    const { settings } = await getUserSettingsFromRoute();
    const defaultLanguage = settings.language ?? "Japanese";
    const difficulty = settings.difficulty ?? "Beginner";

    // Params (back-compat: if input is present and no mode, treat as chat)
    const mode: "generate" | "chat" = body.mode ?? (body.input ? "chat" : "generate");
    const listId = body.listId;
    const explicitLanguage = body.language;
    const input = body.input?.toString();
    const history: Content[] = Array.isArray(body.history) ? body.history : [];

    // Build/derive vocab hint from DB if we have a listId and no explicit vocabHint
    let vocabHint = (body.vocabHint ?? "").trim();
    if (!vocabHint && listId) {
      const supabase = await getSupabaseServerRouteClient();
      const { data: words, error } = await supabase
        .from("Word")
        .select("word_target, word_english")
        .eq("word_list_id", listId)
        .limit(50);

      if (error) {
        console.error("Story API: vocab fetch error", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
      } else if (words?.length) {
        const pairs = words
          .filter(w => w.word_target || w.word_english)
          .map(w => `${w.word_target ?? ""} = ${w.word_english ?? ""}`)
          .slice(0, 25);
        if (pairs.length) {
          vocabHint = `Use these vocabulary items where natural: ${pairs.join(", ")}.`;
        }
      }
    }

    const language = (explicitLanguage ?? defaultLanguage) || "Japanese";

    if (mode === "generate") {
      const instruction = getInstruction(difficulty);
      const prompt = [
        `Language: ${language}`,
        `Difficulty: ${difficulty}`,
        instruction,
        vocabHint && `[Vocabulary bias] ${vocabHint}`,
        `Task: Generate a complete story in ${language} for a ${difficulty} learner.`,
        `Constraints: At least 10 sentences. No explanations or translations. No text formatting.`,
        listId ? `Oasis/List ID: ${listId}` : ``,
      ].filter(Boolean).join("\n");

      const story = await generateGeminiContent(prompt);
      return NextResponse.json({ story, usedSettings: { language, difficulty } });
    }

    // mode === "chat"
    if (!input?.trim()) {
      return NextResponse.json({ error: "Missing input for chat." }, { status: 400 });
    }

    const context = [
      `Answer in ${language}.`,
      `Difficulty: ${difficulty}.`,
      `Be concise. No markdown/formatting.`,
      vocabHint && `Vocabulary to prefer when natural: ${vocabHint}`,
      listId && `This chat belongs to Oasis/List ID: ${listId}`,
    ].filter(Boolean).join(" ");

    const reply = await sendGeminiChat(input, history, context);
    return NextResponse.json({ reply, usedSettings: { language, difficulty } });

  } catch (err) {
    console.error("❌ Story API Error:", err);
    return NextResponse.json({ error: "Gemini request failed" }, { status: 500 });
  }
}
