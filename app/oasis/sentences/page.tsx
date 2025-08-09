"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/components/Button";
import { LinkAsButton } from "@/app/components/LinkAsButton";

//TODO: replace
const wordList = ["りんご", "ねこ", "いぬ", "みず", "やま"];

export default function SentencesPage() {
  const [sentences, setSentences] = useState<Record<string, string>>({});
  const [chatLog, setChatLog] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState("");

  // Call the endpoint to generate a sentence for a word
  const generateSentence = async (word: string) => {
    setSentences((prev) => ({ ...prev, [word]: "Generating..." }));
    try {
      const res = await fetch("/api/sentences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            action: "generate",
            word,
            language: localStorage.getItem("targetLanguage") || "Japanese",
            difficulty: localStorage.getItem("difficultyLevel") || "Beginner",
         }),
      });

      const data = await res.json();
      setSentences((prev) => ({
        ...prev,
        [word]: data.sentence || " Error generating sentence",
      }));
    } catch (err) {
      console.error("Sentence fetch failed:", err);
      setSentences((prev) => ({ ...prev, [word]: "Request failed" }));
    }
  };

  // Initial load: generate all sentences
  useEffect(() => {
    wordList.forEach((w) => generateSentence(w));
  }, []);

  // Chat handler (to new /api/sentences-chat route)
  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = `You: ${chatInput}`;
    setChatLog((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/sentences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            action: "chat", 
            input: chatInput, 
            history: chatLog 
        }),
      });

      const data = await res.json();
      setChatLog((prev) => [...prev, `Gemini: ${data.reply}`]);
    } catch (err) {
      console.error("Chat request failed:", err);
      setChatLog((prev) => [...prev, "Gemini: Chat failed"]);
    }

    setChatInput("");
  };

  return (
    <div className="p-6 min-h-screen">
      <LinkAsButton href="/oasis">Back</LinkAsButton>

      <div className="flex flex-row gap-6">
        {/* LEFT: Sentences List */}
        <div className="flex flex-col flex-1">
          <h1 className="text-xl font-bold mb-2">Example Sentences</h1>

          {wordList.map((word) => (
            <div key={word} className="mb-4 p-3 border rounded">
              <p className="font-semibold">{word}</p>
              <textarea
                className="p-2 border w-full resize-none mt-1"
                value={sentences[word] || "Loading..."}
                readOnly
              />
              <Button className="mt-2" onClick={() => generateSentence(word)}>
                🔄 Regenerate
              </Button>
            </div>
          ))}
        </div>

        {/* RIGHT: Chat Section */}
        <div className="flex flex-col flex-1">
          <h1 className="text-xl font-semibold">Chat</h1>
          <textarea
            className="p-2 border resize-none flex-grow"
            value={chatLog.join("\n")}
            readOnly
          />
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="border p-2 mt-2"
            placeholder="Ask about the sentences..."
          />
          <Button className="mt-2" onClick={sendChat}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
