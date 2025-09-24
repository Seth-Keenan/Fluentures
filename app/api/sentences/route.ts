// app/api/sentences/route.ts
import { NextRequest, NextResponse } from "next/server";
import type { Content } from "@google/generative-ai";
import { generateGeminiContent, getInstruction, sendGeminiChat } from "@/app/lib/util/gemini";
import { getUserSettingsFromRoute } from "@/app/lib/server/getUserSettings";

type SentencesBody = {
  action?: "generate" | "chat";
  word?: string;
  input?: string;
  history?: Content[];
};

export async function POST(req: NextRequest) {
  let body: SentencesBody;
  try {
    body = await req.json();
    console.log("Parsed /api/sentences request:", body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
  }

  try {
    // Always read from DB
    const { settings } = await getUserSettingsFromRoute();
    const language = settings.language ?? "Japanese";
    const difficulty = settings.difficulty ?? "Beginner";
    console.log(`${language}, ${difficulty}`);

    // --- Generate a sentence ---
    if (body.action === "generate") {
      const word = (body.word ?? "").trim();
      if (!word) return NextResponse.json({ error: "Missing required field: word" }, { status: 400 });

      const instruction = getInstruction(difficulty);
      const prompt = `In ${language}, create a single natural sentence using the word "${word}".
${instruction} Replace the word with a blank (______). Do not include explanations.`;

      const sentence = await generateGeminiContent(prompt, 100);
      return NextResponse.json({ sentence, usedSettings: { language, difficulty } });
    }

    // --- Chat about sentences ---
    if (body.action === "chat") {
      const input = (body.input ?? "").trim();
      const history: Content[] = Array.isArray(body.history) ? body.history : [];
      if (!input || history.length === 0) {
        return NextResponse.json({ error: "Missing chat input or history" }, { status: 400 });
      }

      const context = `The user is asking about a sentence in ${language}. Difficulty: ${difficulty}.`;
      const reply = await sendGeminiChat(input, history, context);
      return NextResponse.json({ reply, usedSettings: { language, difficulty } });
    }

    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  } catch (err: unknown) {
    function hasMessage(e: unknown): e is { message?: unknown } {
      return typeof e === "object" && e !== null && "message" in e;
    }

    if (hasMessage(err) && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("❌ /api/sentences error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
