// app/lib/actions/geminiQuizAction.ts

export async function requestQuizSentence(
  word: string
): Promise<string | null> {
  try {
    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // mirror story action
      body: JSON.stringify({ word }), // no language/difficulty
    });

    if (!res.ok) return null;

    const data = await res.json();
    // API returns { sentence, usedSettings? }. We only need the string here.
    return typeof data?.sentence === "string" ? data.sentence : null;
  } catch {
    return null;
  }
}
