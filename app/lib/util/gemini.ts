import { GoogleGenerativeAI, Content } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

//  Helper to get the model once
export function getGeminiModel() {
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
}

//  Difficulty → Instruction mapping
export function getInstruction(difficulty: string): string {
  switch (difficulty) {
    case "Beginner":
      return "Use very simple vocabulary and sentence structures.";
    case "Intermediate":
      return "Use moderately complex vocabulary and grammar.";
    case "Advanced":
      return "Use natural and idiomatic expressions with some advanced grammar.";
    default:
      return "Use clear and natural expressions.";
  }
}

//  Shared content generation function
export async function generateGeminiContent(prompt: string, maxTokens = 2048) {
  const model = getGeminiModel();
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.9,
      topK: 2,
      topP: 1,
      maxOutputTokens: maxTokens,
    },
  });
  return result.response.text();
}

//  Shared chat function
export async function sendGeminiChat(input: string, history: Content[], contextMessage: string) {
  const model = getGeminiModel();
  const chat = model.startChat({
    history: history.concat([{ role: "user", parts: [{ text: contextMessage }] }]),
  });
  const result = await chat.sendMessage(input);
  return result.response.text();
}
