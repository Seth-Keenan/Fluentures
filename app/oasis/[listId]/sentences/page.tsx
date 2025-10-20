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
  <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4">
        <LinkAsButton href={`/oasis/${listId}`}>Back</LinkAsButton>
        <div className="text-right">
          <p className="text-sm text-neutral-500">Oasis</p>
          <p className="text-base font-medium text-neutral-800">
            {meta?.name ?? "Oasis"}
            <span className="ml-2 text-neutral-400">
              • {meta?.language ?? "—"} • {targets.length} words
            </span>
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* LEFT: Sentences List */}
        <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-100 p-4 md:p-5">
            <h1 className="text-lg font-semibold tracking-tight md:text-xl">
              Example Sentences
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              Language: {meta?.language ?? "—"} · Words: {targets.length}
            </p>
          </div>

          <div className="p-4 md:p-5 space-y-4">
            {targets.length === 0 && (
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
                No words yet. Add some in <span className="font-medium">Edit Oasis</span>.
              </div>
            )}

            {targets.map((word) => (
              <div key={word} className="rounded-xl border border-neutral-200 p-4">
                <p className="font-semibold text-neutral-800">{word}</p>
                <textarea
                  className="mt-2 h-32 w-full resize-none rounded-xl border border-neutral-200 bg-white/90 p-3 text-neutral-800 shadow-inner outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-400/60"
                  value={
                    sentences[word] ||
                    (generating ? "Generating..." : "No sentence yet")
                  }
                  readOnly
                />
                <Button
                  className="mt-3 px-4 py-2"
                  onClick={() => regenerateOne(word)}
                  disabled={generating}
                >
                  🔄 Regenerate
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* RIGHT: Chat Section */}
        <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-100 p-4 md:p-5">
            <h2 className="text-lg font-semibold tracking-tight md:text-xl">Chat</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Ask about the sentences or request variations.
            </p>
          </div>

          <div className="p-4 md:p-5">
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Conversation
            </label>
            <textarea
              className="h-64 w-full resize-none rounded-xl border border-neutral-200 bg-white/90 p-3 text-neutral-800 shadow-inner outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-400/60"
              value={chatLog.join("\n")}
              readOnly
              placeholder="Messages will appear here."
            />

            <div className="mt-3 flex items-center gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 rounded-full border border-neutral-200 bg-white/90 px-4 py-2 text-sm outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-400/60"
                placeholder="Ask about the sentences..."
              />
              <Button className="px-4 py-2" onClick={sendChat}>
                Send
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
);

}