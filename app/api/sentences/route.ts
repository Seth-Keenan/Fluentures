import { NextRequest, NextResponse } from "next/server";
import { generateGeminiContent, getInstruction, sendGeminiChat } from "@/app/lib/util/gemini";
import { Content } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
    console.log("Parsed /api/sentences request:", body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
  }

  const { action, word, language = "Japanese", difficulty = "Beginner", input, history } = body;

  // Generate a sentence
  if (action === "generate" && word) {
    const instruction = getInstruction(difficulty);
    const prompt = `In ${language}, create a single natural sentence using the word "${word}". 
    ${instruction} Replace the word with a blank (______). Do not include explanations.`;

    try {
      const sentence = await generateGeminiContent(prompt, 100);
      return NextResponse.json({ sentence });
    } catch (err) {
      console.error("Sentence generation error:", err);
      return NextResponse.json({ error: "Failed to generate sentence" }, { status: 500 });
    }
  }

  // Chat about sentences
  const context = `The user is asking about a sentence in ${language}. Difficulty: ${difficulty}.`;
  if (action === "chat" && input && history) {
    try {
      const reply = await sendGeminiChat(input, history as Content[], context);
      return NextResponse.json({ reply });
    } catch (err) {
      console.error("Sentence chat error:", err);
      return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
}
