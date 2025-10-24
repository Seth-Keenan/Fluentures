import { NextRequest, NextResponse } from "next/server";
import { generateGeminiContent, getInstruction } from "@/app/lib/util/gemini";
import { getUserSettingsFromRoute } from "@/app/login/server/getUserSettings";

type QuizBody = { listId?: string; word?: string; language?: string };


// async function buildVocabHint(_listId?: string) {
//   return "";
// }

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

    // Intentionally empty so model doesn't stuff extra vocab
    // const _vocabHint = await buildVocabHint(body.listId);

    const instruction = getInstruction(difficulty);
    const prompt = [
      `Write exactly ONE natural sentence in ${language}.`,
      `It must appropriately use the target word "${word}" in context,`,
      `but REPLACE that occurrence with a single blank: "____".`,
      `Do NOT include the target word text anywhere in the output.`,
      `Do NOT use any other vocabulary from the user's word list.`,
      `Return ONLY the sentence (no translation, no explanations, no formatting).`,
      instruction,
      body.listId && `Oasis/List ID: ${body.listId}`
    ]
      .filter(Boolean)
      .join("\n");

    const sentence = await generateGeminiContent(prompt);
    return NextResponse.json({ sentence, usedSettings: { language, difficulty } });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("❌ Quiz sentence generation error:", err);
    return NextResponse.json({ error: "Failed to generate quiz sentence" }, { status: 500 });
  }
}
