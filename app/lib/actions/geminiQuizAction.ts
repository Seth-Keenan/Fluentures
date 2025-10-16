// app/lib/actions/geminiQuizAction.ts
export async function requestQuizSentence(
  opts: { listId: string; word: string; language?: string }
): Promise<string | null> {
  try {
    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        listId: opts.listId,
        word: opts.word,
        language: opts.language, // optional override
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.sentence === "string" ? data.sentence : null;
  } catch {
    return null;
  }
}
