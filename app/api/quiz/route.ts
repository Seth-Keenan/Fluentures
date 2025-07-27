import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getUserSettings } from '@/app/lib/helpers/getUserSettings';
import { getDifficultyInstruction } from '@/app/lib/helpers/getDifficultyInstructions';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
    console.log("✅ Parsed quiz request body:", body);
  } catch (err) {
    console.error("❌ Failed to parse JSON body:", err);
    return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
  }

  const { action, word } = body;

  // Get user settings
  const { user, settings } = await getUserSettings();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { language, difficulty } = settings;

  if (!word || !language) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const instruction = getDifficultyInstruction(difficulty);

  let model;
  try {
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  } catch (err) {
    console.error("❌ Error initializing Gemini model:", err);
    return NextResponse.json({ error: "Model initialization failed" }, { status: 500 });
  }
  
try {
    // Generate an example sentence for a word
    if (action === "sentence" && word) {
      const prompt = `In ${language}, create a single natural sentence using the word "${word}". ${instruction} 
                      Replace the word with a blank. Do not include translations or explanations. 
                      Example format: "私は______を食べました。"`; 

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          topK: 2,
          topP: 1,
          maxOutputTokens: 100,
        },
      });

      return NextResponse.json({ sentence: result.response.text() });
    }

    // Invalid requests
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  } catch (error) {
    console.error("❌ Gemini Quiz API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}