// app/api/story/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateGeminiContent, getInstruction, sendGeminiChat } from "@/app/lib/util/gemini";
import { Content } from "@google/generative-ai";
import { getUserSettingsFromRoute } from "@/app/lib/server/getUserSettings";

export async function POST(req: NextRequest) {
  interface StoryRequestBody {
    input?: string;
    history?: Content[];
  }
  let body: StoryRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
  }

  try {
    const { settings } = await getUserSettingsFromRoute();

    const language = settings.language ?? "Japanese";
    const difficulty = settings.difficulty ?? "Beginner";

    const input: string | undefined = body.input;
    const history: Content[] = (body.history as Content[]) ?? [];

    if (!input) {
      const instruction = getInstruction(difficulty);
      const prompt = [
        `Language: ${language}`,
        `Difficulty: ${difficulty}`,
        `${instruction}`,
        `Task: Generate a complete story in ${language} for a ${difficulty} learner.`,
        `Constraints: At least 10 sentences. No explanations or translations. No text formatting.`,
      ].join("\n");

      const story = await generateGeminiContent(prompt);
      return NextResponse.json({ story, usedSettings: { language, difficulty } });
    }

    const context = `The user is asking about a story in ${language}. Difficulty: ${difficulty}. Response should not have text formatting, should be nice and concise.`;
    const reply = await sendGeminiChat(input, history, context);
    return NextResponse.json({ reply, usedSettings: { language, difficulty } });

  } catch (err) {
    console.error("❌ Story API Error:", err);
    return NextResponse.json({ error: "Gemini request failed" }, { status: 500 });
  }
}
