"use server";

import type { HistoryItem } from "@/app/types/gemini";
import { getBaseUrl } from "@/app/lib/util/getBaseUrl";

export async function requestStory(
  language: string,
  difficulty: string
): Promise<string | null> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/story`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language, difficulty }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Story API Error:", error);
      return null;
    }

    const data = await res.json();
    return data.story ?? null;
  } catch (err) {
    console.error("Story fetch error:", err);
    return null;
  }
}

export async function sendStoryChat(
  input: string,
  history: HistoryItem[]
): Promise<string | null> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/story`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input, history }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error);
    }

    const data = await res.json();
    return data.reply ?? "No reply received.";
  } catch (err) {
    console.error("Story chat error:", err);
    return null;
  }
}
