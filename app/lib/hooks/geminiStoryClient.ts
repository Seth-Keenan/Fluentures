"use server";

import type { HistoryItem } from "@/app/types/gemini";

export async function requestStory(language: string, difficulty: string): Promise<string | null> {
  try {
    const res = await fetch("/api/story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "generate",
        language,
        difficulty,
      }),
    });

    const data = await res.json();
    return data.story ?? null;
  } catch (err) {
    console.error("❌ Failed to fetch story:", err);
    return null;
  }
}

export async function sendStoryChat(input: string, history: HistoryItem[]): Promise<string | null> {
  try {
    const res = await fetch("/api/story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input,
        history,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unknown error from server.");
    return data.reply ?? "No reply received.";
  } catch (err) {
    console.error("❌ Chat error:", err);
    return null;
  }
}
