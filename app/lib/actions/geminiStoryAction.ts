// app/lib/actions/geminiStoryAction.ts
export async function requestStory(): Promise<string | { story: string; usedSettings?: { language: string; difficulty: string } } | null> {
  try {
    const res = await fetch("/api/story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({}), // no language/difficulty
    });
    if (!res.ok) return null;
    const data = await res.json();
    // Support both shapes (string or {story,...})
    let result: string | { story: string; usedSettings?: { language: string; difficulty: string } } | null;
    if (typeof data?.story === "string") {
      result = data;
    } else if (data?.story) {
      result = data;
    } else {
      result = null;
    }
    return result;
  } catch {
    return null;
  }
}

import type { HistoryItem } from "@/app/types/gemini";
export async function sendStoryChat(input: string, history: HistoryItem[]): Promise<{ text: string; usedSettings?: { language: string; difficulty: string } } | null> {
  try {
    const res = await fetch("/api/story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ input, history }), // server reads settings from DB
    });
    if (!res.ok) return null;
    const data = await res.json();
    // Normalize to { text, usedSettings? }
    if (typeof data?.reply === "string") return { text: data.reply, usedSettings: data.usedSettings };
    return null;
  } catch {
    return null;
  }
}
