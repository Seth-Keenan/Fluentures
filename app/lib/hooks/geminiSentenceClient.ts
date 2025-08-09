"use server";
import { getBaseUrl } from "@/app/lib/util/getBaseUrl";
import type { HistoryItem } from "@/app/types/gemini";


export async function requestSentence(
  word: string,
  language: string,
  difficulty: string
): Promise<string | null> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/sentences`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, language, difficulty, action: "generate"}),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Sentences API Error:", error);
      return null;
    }

    const data = await res.json();
    return data.sentence ?? null;
  } catch (err) {
    console.error("Sentences fetch error:", err);
    return null;
  }
}

export async function sendSentenceChat(input: string, history: HistoryItem[]): Promise<string | null> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/sentences`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "chat",
        input,
        history,
        language,
        difficulty,
      })
    });

    if (!res.ok) {
      console.error("Sentence chat API error:", await res.text());
      return null;
    }

    const data = await res.json();
    return data.reply ?? "No reply received.";
  } catch (err) {
    console.error("Sentence chat fetch error:", err);
    return null;
  }
}