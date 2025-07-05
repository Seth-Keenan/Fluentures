import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

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

  const { word, language, difficulty } = body;

  if (!word || !language) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  let instruction = "";
  switch (difficulty) {
    case "Beginner":
      instruction = "Use simple grammar and vocabulary.";
      break;
    case "Intermediate":
      instruction = "Use moderately complex grammar and vocabulary.";
      break;
    case "Advanced":
      instruction = "Use more natural, idiomatic language.";
      break;
  }

  const prompt = `In ${language}, give me a natural sentence using "${word}". ${instruction} Replace the word with a blank line. No explanation. Format: "私は______を食べました。But be creative and use a different context than the example, and make natural sentences that people actually use."`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.95,
        topK: 20,
        topP: 1,
        maxOutputTokens: 100,
      },
    });

    return NextResponse.json({ sentence: result.response.text() });
  } catch (error) {
    console.error("❌ Sentence generation error:", error);
    return NextResponse.json({ error: "Failed to generate sentence" }, { status: 500 });
  }
}
