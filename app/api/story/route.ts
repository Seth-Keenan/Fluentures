// app/api/story/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { generateGeminiContent, getInstruction, sendGeminiChat } from "@/app/lib/util/gemini";
import { Content } from "@google/generative-ai";

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
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: row } = await supabase
      .from("UserSettings")
      .select("language, difficulty")
      .eq("user_id", user.id)
      .maybeSingle();

    const language = row?.language ?? "Japanese";
    const difficulty = row?.difficulty ?? "Beginner";

    const input: string | undefined = body.input;
    const history: Content[] = (body.history as Content[]) ?? [];

    if (!input) {
      const instruction = getInstruction(difficulty);
      const prompt = [
        `Language: ${language}`,
        `Difficulty: ${difficulty}`,
        `${instruction}`,
        `Task: Generate a complete story in ${language} for a ${difficulty} learner.`,
        `Constraints: At least 10 sentences. No explanations or translations.`,
      ].join("\n");

      const story = await generateGeminiContent(prompt);
      return NextResponse.json({ story, usedSettings: { language, difficulty } });
    }

    const context = `The user is asking about a story in ${language}. Difficulty: ${difficulty}.`;
    const reply = await sendGeminiChat(input, history, context);
    return NextResponse.json({ reply, usedSettings: { language, difficulty } });

  } catch (err) {
    console.error("❌ Story API Error:", err);
    return NextResponse.json({ error: "Gemini request failed" }, { status: 500 });
  }
}
