// Types can be reused
export type RequestStoryOpts = {
  listId: string;
  language?: string;         // from WordList meta (optional)
  vocabHint?: string;        // brief "target = english, ..." list
};

export async function requestStory(
  opts: RequestStoryOpts
): Promise<string | { story: string; usedSettings?: { language: string; difficulty: string } } | null> {
  try {
    const res = await fetch("/api/story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        mode: "generate",
        listId: opts.listId,
        language: opts.language,
        vocabHint: opts.vocabHint,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    // Accept either a string-like payload or an object with {story}
    if (typeof data?.story === "string") return data;
    if (data?.story) return data;
    return null;
  } catch {
    return null;
  }
}

import type { HistoryItem } from "@/app/types/gemini";

export async function sendStoryChat(
  input: string,
  history: HistoryItem[],
  extra?: { listId?: string }
): Promise<{ text: string; usedSettings?: { language: string; difficulty: string } } | null> {
  try {
    const res = await fetch("/api/story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        mode: "chat",
        input,
        history,
        listId: extra?.listId,   // handy for server-side logging/trace
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (typeof data?.reply === "string") return { text: data.reply, usedSettings: data.usedSettings };
    return null;
  } catch {
    return null;
  }
}
