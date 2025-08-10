"use server";
import { getBaseUrl } from "@/app/lib/util/getBaseUrl";


export async function requestQuizSentence(
  word: string,
  language: string,
  difficulty: string
): Promise<string | null> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/quiz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, language, difficulty }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("❌ Quiz API Error:", error);
      return null;
    }

    const data = await res.json();
    return data.sentence ?? null;
  } catch (err) {
    console.error("❌ Quiz fetch error:", err);
    return null;
  }
}
