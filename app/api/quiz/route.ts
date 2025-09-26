// app/api/quiz/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateGeminiContent, getInstruction } from "@/app/lib/util/gemini";
import { getUserSettingsFromRoute } from "@/app/lib/server/getUserSettings";

export async function POST(req: NextRequest) {
  type QuizBody = { word?: string };
  let body: QuizBody;

  try {
    body = await req.json();
    console.log("✅ Parsed quiz request:", body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
  }

  const word = typeof body.word === "string" ? body.word.trim() : "";
  if (!word) {
    return NextResponse.json({ error: "Missing required field: word" }, { status: 400 });
  }

  try {
    // Read language/difficulty from DB
    const { settings } = await getUserSettingsFromRoute();
    const language = settings.language ?? "Japanese";
    const difficulty = settings.difficulty ?? "Beginner";
    console.log(`${language}, ${difficulty}`);

    const instruction = getInstruction(difficulty);
    const prompt = `In ${language}, create a natural, commonly used sentence that contains the word "${word}".
    ${instruction} Replace the word with a blank (______). Do not include any translations or explanations.
    Be creative, use a natural context different from the example "私は______を食べました。"`;    

    const sentence = await generateGeminiContent(prompt, 100);
    return NextResponse.json({ sentence, usedSettings: { language, difficulty } });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("❌ Quiz sentence generation error:", err);
    return NextResponse.json({ error: "Failed to generate quiz sentence" }, { status: 500 });
  }
}
