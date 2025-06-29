// app/api/gemini/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, Content } from "@google/generative-ai";

// Initialize the Google AI client
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

    //TODO: Replace with actual logic to get user preferences from a database or session
    const language = body.language //<<|| await getLanguageFromDB(body.userId);
    const difficulty = body.difficulty //<<|| await getDifficultyFromDB(body.userId);

    // Prompt set up
    if (language) {
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
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: generationConfig,
      });
      const response = result.response;
      return NextResponse.json({ story: response.text() });
    }

    // SCENARIO 2: HANDLE A CHAT MESSAGE
    else if (body.input && body.history) {
      const chat = model.startChat({
        history: body.history as Content[],
      });

    // SCENARIO 3: GENERATE A SENTENCE USING A WORD
    if (body.action === "sentence" && body.word && body.language) {
      const prompt = `In ${body.language}, give me a single natural sentence that uses the word "${body.word}". Replace the word with a blank line. For example, "私は______を食べました。" Do not include any explanations, just the sentence.`;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          topK: 2,
          topP: 1,
          maxOutputTokens: 100,
        },
      });

  const response = result.response;
  return NextResponse.json({ sentence: response.text() });
    }
      const result = await chat.sendMessage(body.input);
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
