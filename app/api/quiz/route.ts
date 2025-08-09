import { NextRequest, NextResponse } from "next/server";
import { generateGeminiContent, getInstruction } from "@/app/lib/util/gemini";

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
    console.log("✅ Parsed quiz request:", body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
  }

  const { word, language = "Japanese", difficulty = "Beginner" } = body;

  if (!word || !language) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const instruction = getInstruction(difficulty);
  const prompt = `In ${language}, create a natural, commonly used sentence that contains the word "${word}". 
${instruction} Replace the word with a blank (______). Do not include any translations or explanations. 
Be creative, use a natural context different from the example "私は______を食べました。"`;

  try {
    const sentence = await generateGeminiContent(prompt, 100);
    return NextResponse.json({ sentence });
  } catch (err) {
    console.error("❌ Quiz sentence generation error:", err);
    return NextResponse.json({ error: "Failed to generate quiz sentence" }, { status: 500 });
  }
}
