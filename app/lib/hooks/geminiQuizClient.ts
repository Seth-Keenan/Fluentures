"use server";

export async function getExampleSentence(
  word: string,
  language: string,
  difficulty: string
): Promise<string | null> {
  try {
    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "sentence",
        word,
        language,
        difficulty,
      }),
    });

    if (!res.ok) {
      console.error("❌ Gemini request failed:", res.statusText);
      return null;
    }

    const data = await res.json();
    return data.sentence ?? null;
  } catch (error) {
    console.error("❌ Error fetching Gemini sentence:", error);
    return null;
  }
}
