import { NextRequest, NextResponse } from "next/server";
import { generateGeminiContent, getInstruction, sendGeminiChat } from "@/app/lib/util/gemini";
import { Content } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
    console.log("✅ Parsed request body:", body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
  }

  const { language = "Japanese", difficulty = "Beginner", input, history = [] } = body;

  try {
    // Generate Story
    if (!input) {
      const instruction = getInstruction(difficulty);
      const prompt = `Generate a complete story in ${language} for a ${difficulty} learner. 
      ${instruction} At least 10 sentences. No explanations or translations.`;

      const story = await generateGeminiContent(prompt);
      return NextResponse.json({ story });
    }

    // Chat about Story
    const context = `The user is asking about a story in ${language}. Difficulty: ${difficulty}.`;
    const reply = await sendGeminiChat(input, history as Content[], context);
    return NextResponse.json({ reply });

  } catch (err) {
    console.error("❌ Story API Error:", err);
    return NextResponse.json({ error: "Gemini request failed" }, { status: 500 });
  }
}
