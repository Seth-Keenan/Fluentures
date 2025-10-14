"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/components/Button";
import { LinkAsButton } from "@/app/components/LinkAsButton";
import { useOasis } from "@/app/context/OasisContext";

// TODO: replace demo list


const wordList = ["りんご", "ねこ", "いぬ", "みず", "やま"];

// Minimal history type that matches your API's expected shape
type HistoryItem = {
  role: "user" | "model";
  parts: { text: string }[];
};
const toUser = (text: string): HistoryItem => ({ role: "user", parts: [{ text }] });
const toModel = (text: string): HistoryItem => ({ role: "model", parts: [{ text }] });

export default function SentencesPage() {
  const { oasisId, setOasisId } = useOasis();
  const [sentences, setSentences] = useState<Record<string, string>>({});
  const [chatLog, setChatLog] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [apiHistory, setApiHistory] = useState<HistoryItem[]>([]);

  // Generate a sentence for a given word (server reads settings)
  const generateSentence = async (word: string) => {
    setSentences((prev) => ({ ...prev, [word]: "Generating..." }));
    try {
      const res = await fetch("/api/sentences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "generate",
          word,
        }),
      });

      const data = await res.json();
      setSentences((prev) => ({
        ...prev,
        [word]: data?.sentence || " Error generating sentence",
      }));
    } catch (err) {
      console.error("Sentence fetch failed:", err);
      setSentences((prev) => ({ ...prev, [word]: "Request failed" }));
    }
  };

  // Initial load: generate all sentences
  useEffect(() => {
    wordList.forEach((w) => generateSentence(w));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Chat (server reads settings)
  const sendChat = async () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatLog((prev) => [...prev, `You: ${userMsg}`]);
    setChatInput("");

    // Append user message to API history
    const newHistory = [...apiHistory, toUser(userMsg)];

    try {
      const res = await fetch("/api/sentences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "chat",
          input: userMsg,
          history: newHistory, // properly typed history
        }),
      });

      const data = await res.json();
      const replyText: string | null =
        typeof data?.reply === "string" ? data.reply : null;

      if (replyText) {
        setChatLog((prev) => [...prev, `Gemini: ${replyText}`]);
        setApiHistory([...newHistory, toModel(replyText)]);
      } else {
        setChatLog((prev) => [...prev, "Gemini: Chat failed"]);
      }
    } catch (err) {
      console.error("Chat request failed:", err);
      setChatLog((prev) => [...prev, "Gemini: Chat failed"]);
    }
  };

  return (
    <div className="p-6 min-h-screen">
      <LinkAsButton href="/oasis">Back</LinkAsButton>

      <div className="flex flex-row gap-6">
        {/* LEFT: Sentences List */}
        <div className="flex flex-col flex-1">
          <h1 className="text-xl font-bold mb-2">Example Sentences - Oasis {oasisId}</h1>

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
