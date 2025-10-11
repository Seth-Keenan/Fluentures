"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/app/components/Button";
import { LinkAsButton } from "@/app/components/LinkAsButton";
import { useOasisData } from "@/app/lib/hooks/useOasis";
import { requestSentence, sendSentenceChat } from "@/app/lib/actions/geminiSentenceAction";

// Minimal history type (matches your API)
type HistoryItem = { role: "user" | "model"; parts: { text: string }[] };
const toUser = (text: string): HistoryItem => ({ role: "user", parts: [{ text }] });
const toModel = (text: string): HistoryItem => ({ role: "model", parts: [{ text }] });

export default function SentencesPage() {
  const { listId, meta, words, loading } = useOasisData();

  // derive the target tokens from the oasis list
  const targets = useMemo(() => words.map(w => (w.target ?? "").trim()).filter(Boolean), [words]);

  const [sentences, setSentences] = useState<Record<string, string>>({});
  const [chatLog, setChatLog] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [apiHistory, setApiHistory] = useState<HistoryItem[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!listId || loading) return;
    // generate once when data arrives
    (async () => {
      setGenerating(true);
      for (const word of targets) {
        setSentences(prev => ({ ...prev, [word]: "Generating..." }));
        const s = await requestSentence({ listId, word, language: meta?.language ?? undefined });
        setSentences(prev => ({ ...prev, [word]: s || " Error generating sentence" }));
      }
      setGenerating(false);
    })();
  }, [listId, loading, targets, meta?.language]);

  const regenerateOne = async (word: string) => {
    if (!listId) return;
    setSentences(prev => ({ ...prev, [word]: "Generating..." }));
    const s = await requestSentence({ listId, word, language: meta?.language ?? undefined });
    setSentences(prev => ({ ...prev, [word]: s || " Error generating sentence" }));
  };

  const sendChat = async () => {
    if (!chatInput.trim() || !listId) return;

    const userMsg = chatInput.trim();
    setChatLog(prev => [...prev, `You: ${userMsg}`]);
    setChatInput("");

    const history = [...apiHistory, toUser(userMsg)];
    const reply = await sendSentenceChat(userMsg, history, { listId });
    const replyText = reply?.text ?? null;

    if (replyText) {
      setChatLog(prev => [...prev, `Gemini: ${replyText}`]);
      setApiHistory([...history, toModel(replyText)]);
    } else {
      setChatLog(prev => [...prev, "Gemini: Chat failed"]);
    }
  };

  if (!listId) return <div className="p-6">Missing list id.</div>;
  if (loading) return <div className="p-6">Loading oasis…</div>;


  return (
    <div className="p-6 min-h-screen">
      <LinkAsButton href={`/oasis/${listId}`}>Back</LinkAsButton>

      <div className="mb-3">
        <h1 className="text-xl font-bold">Example Sentences — {meta?.name ?? "Oasis"}</h1>
        <p className="text-sm text-gray-500">
          Language: {meta?.language ?? "—"} · Words: {targets.length}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* LEFT: Sentences List */}
        <div className="flex flex-col flex-1">
          {targets.length === 0 && (
            <div className="text-sm text-gray-500">No words yet. Add some in Edit Oasis.</div>
          )}

          {targets.map((word) => (
            <div key={word} className="mb-4 p-3 border rounded">
              <p className="font-semibold">{word}</p>
              <textarea
                className="p-2 border w-full resize-none mt-1"
                value={sentences[word] || (generating ? "Generating..." : "No sentence yet")}
                readOnly
              />
              <Button className="mt-2" onClick={() => regenerateOne(word)} disabled={generating}>
                🔄 Regenerate
              </Button>
            </div>
          ))}
        </div>

        {/* RIGHT: Chat Section */}
        <div className="flex flex-col flex-1">
          <h1 className="text-xl font-semibold">Chat</h1>
          <textarea
            className="p-2 border resize-none flex-grow min-h-[240px]"
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