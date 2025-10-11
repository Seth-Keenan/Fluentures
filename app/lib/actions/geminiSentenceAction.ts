// app/lib/actions/geminiSentenceAction.ts

import type { HistoryItem } from "@/app/types/gemini";

// Request a sentence for a given word in a list, optionally specifying language
export async function requestSentence(
  opts: { listId: string; word: string; language?: string }
): Promise<string | null> {
  try {
    const res = await fetch("/api/sentences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        action: "generate",
        listId: opts.listId,
        word: opts.word,
        language: opts.language, // optional override (server still uses user settings if omitted)
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.sentence === "string" ? data.sentence : null;
  } catch {
    return null;
  }
}

// Send a chat message about sentences, with history
export async function sendSentenceChat(
  input: string,
  history: HistoryItem[],
  extra?: { listId?: string }
): Promise<{ text: string; usedSettings?: { language: string; difficulty: string } } | null> {
  try {
    const res = await fetch("/api/sentences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        action: "chat",
        input,
        history,
        listId: extra?.listId, // for context/logging on the server
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.reply === "string"
      ? { text: data.reply, usedSettings: data.usedSettings }
      : null;
  } catch {
    return null;
  }
}
