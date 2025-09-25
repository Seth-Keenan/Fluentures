// app/lib/actions/geminiSentencesAction.ts

import type { HistoryItem } from "@/app/types/gemini";

export async function requestSentence(word: string): Promise<string | null> {
  try {
    const res = await fetch("/api/sentences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "generate", word }), // server reads settings from DB
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.sentence === "string" ? data.sentence : null;
  } catch {
    return null;
  }
}

export async function sendSentenceChat(
  input: string,
  history: HistoryItem[]
): Promise<{ text: string; usedSettings?: { language: string; difficulty: string } } | null> {
  try {
    const res = await fetch("/api/sentences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "chat", input, history }), // server reads settings from DB
    });
    if (!res.ok) return null;
    const data = await res.json();
    // Normalize to { text, usedSettings? }
    return typeof data?.reply === "string"
      ? { text: data.reply, usedSettings: data.usedSettings }
      : null;
  } catch {
    return null;
  }
}
