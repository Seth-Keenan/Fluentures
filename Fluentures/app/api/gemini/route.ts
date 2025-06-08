// app/api/gemini/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, Content } from "@google/generative-ai";

// Initialize the Google AI client
// It's best practice to initialize it once outside of the request handler
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
/* Handles POST requests to the Gemini API.
  * Stateless endpoint that generates a story or answers a question based on the input.*/
export async function POST(req: NextRequest) {

    const body = await req.json(); // Parse the JSON body of the request
    console.log("Received request body:", body);
    
  // Check for the API Key 
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'API key is missing' }, { status: 500 });
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }); // Get the Gemini model

  try {

    // SCENARIO 1: GENERATE A NEW STORY
    if (body.language) {
      const prompt = `Generate a complete story in the ${body.language} language. The story should be suitable for a beginner learning the language. Make it 8-16 sentences long. No preamble or summary, just the story. No translations or other extras.`;
      const result = await model.generateContent(prompt);
      const response = result.response;
      return NextResponse.json({ story: response.text() });
    }

    // SCENARIO 2: HANDLE A CHAT MESSAGE
    else if (body.input && body.history) {
      const chat = model.startChat({
        history: body.history as Content[],
      });
      const result = await chat.sendMessage(body.input);
      const response = result.response;
      return NextResponse.json({ reply: response.text() });
    }
    // If the request doesn't match either scenario
    else {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
  }
  catch (error){
    console.error('Gemini API error: ', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }

}
