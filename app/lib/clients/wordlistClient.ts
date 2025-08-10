"use server";
import type { WordItem, WordListFile } from "@/app/types/wordlist";

export async function getWordlist(): Promise<WordItem[]> {
  try {
    const res = await fetch("/api/wordlist", { method: "GET", cache: "no-store" });
    if (!res.ok) throw new Error(await res.text());
    const data = (await res.json()) as WordListFile;
    return data.items ?? [];
  } catch (err) {
    console.error("getWordlist error:", err);
    return [];
  }
}

export async function saveWordlist(items: WordItem[]): Promise<boolean> {
  try {
    const res = await fetch("/api/wordlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    if (!res.ok) throw new Error(await res.text());
    return true;
  } catch (err) {
    console.error("saveWordlist error:", err);
    return false;
  }
}
