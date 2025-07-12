// app/api/gemini/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, Content } from "@google/generative-ai";

// Initialize the Google AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/* Handles POST requests to the Gemini API.
  * Stateless endpoint that generates a story or answers a question based on the input.*/
export async function POST(req: NextRequest) {
    let body;
    try {
      body = await req.json();
      console.log("✅ Parsed request body:", body);
    } catch (err) {
      console.error("❌ Failed to parse JSON body:", err);
      return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
    }

  // Extract relevant fields from the parsed body
  const { language, difficulty, input, history } = body;  

  let model;
  try {
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  } 
  catch (err) 
  {
    console.error("❌ Error initializing Gemini model:", err);
    return NextResponse.json({ error: "Model initialization failed" }, { status: 500 });
  }

  try {

    // SCENARIO 2: GENERATE A NEW STORY   

    // Prompt set up
    if (language && difficulty) {
      //Configuration for the story generation
      const generationConfig = {
        temperature: 0.9, //Higher creativity (0.0-1.0)
        topK: 2, //Top-K sampling to limit the number of tokens considered at each step (1-40)
        topP: 1, //Top-P sampling to control diversity (0.0-1.0)
        maxOutputTokens: 2048,
      }

    let instruction = '';
    switch (difficulty) {
      case 'Beginner':
        instruction = 'Use very simple vocabulary and sentence structures.';
        break;
      case 'Intermediate':
        instruction = 'Use moderately complex vocabulary and grammar.';
        break;
      case 'Advanced':
        instruction = 'Use natural and idiomatic expressions, with some advanced grammar.';
        break;
    }

      // Prompt for generating a story
      const prompt = `Generate a complete story in the ${language} language. 
                      The story should be suitable for a ${difficulty.toLowerCase()} learning the language. 
                      ${instruction} The story should be at least 10 sentences long. Do not include explanations or translations.`;
      try {
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig,
        });

        return NextResponse.json({ story: result.response.text() });
      } catch (error) {
        console.error("❌ Story generation error:", error);
        return NextResponse.json({ error: "Failed to generate story" }, { status: 500 });
      }
    }

    // HANDLE A CHAT MESSAGE
    else if (input && history) {
      const chat = model.startChat({
        history: history as Content[],
      });

      const result = await chat.sendMessage(input);
      const response = result.response;
      return NextResponse.json({ reply: response.text() });
    }

    // If the request doesn't match any scenario
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