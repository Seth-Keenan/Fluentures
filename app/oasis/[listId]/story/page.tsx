"use client";
import { useState } from "react";
import { useOasisData } from "@/app/lib/hooks/useOasis";
import { Button } from "@/app/components/Button";
import { LinkAsButton } from "@/app/components/LinkAsButton";
import { requestStory, sendStoryChat } from "@/app/lib/actions/geminiStoryAction";
import type { HistoryItem } from "@/app/types/gemini";

// typed helpers so role is "user" | "model"
const toUser = (text: string): HistoryItem => ({ role: "user", parts: [{ text }] });
const toModel = (text: string): HistoryItem => ({ role: "model", parts: [{ text }] });

// helper: build a brief vocab prompt from your list
function buildVocabHint(words: { target: string; english: string }[], max = 20) {
  const trimmed = words.slice(0, max).map(w => `${w.target} = ${w.english}`).join(", ");
  return trimmed ? `Use these vocabulary items where natural: ${trimmed}.` : "";
}

export default function StoryPage() {
  const { listId, meta, words, loading } = useOasisData();

  const [story, setStory] = useState("");
  const [chatLog, setChatLog] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiHistory, setApiHistory] = useState<HistoryItem[]>([]);

  if (!listId) return <p className="p-6">Missing list id.</p>;
  if (loading) return <p className="p-6">Loading oasis…</p>;

  // Generate a new story, scoped to this oasis
  const generateStory = async () => {
    setStory("Generating…");
    setChatLog([]);
    setApiHistory([]);

    // pass context to your server action
    const vocabHint = buildVocabHint(words, 20);
    const res = await requestStory({
      listId,
      language: meta?.language ?? undefined,
      vocabHint,
    });

    const storyText =
      typeof res === "string" ? res : res?.story ?? "Failed to generate story.";
    setStory(storyText);
  };

  const sendChat = async () => {
    if (!chatInput.trim() || isLoading) return;

    setIsLoading(true);
    const currentInput = chatInput;
    setChatLog(prev => [...prev, `You: ${currentInput}`]);
    setChatInput("");

    const seededContext: HistoryItem[] = [
      toUser(
        `Here is the story for Oasis "${meta?.name ?? ""}" (id: ${listId}). Use the same language and reference these vocabulary items when helpful. Story: """${story}""". ${buildVocabHint(words, 20)}`
      ),
      toModel("Okay, I have the story and vocabulary. I will answer your questions about it."),
    ];
    const historyForApi = apiHistory.length === 0 ? seededContext : apiHistory;

    const reply = await sendStoryChat(currentInput, historyForApi, { listId });
    const replyText = typeof reply === "string" ? reply : reply?.text ?? null;

    if (replyText) {
      setChatLog(prev => [...prev, `Camel: ${replyText}`]);
      setApiHistory([...historyForApi, toUser(currentInput), toModel(replyText)]);
    } else {
      setChatLog(prev => [...prev, "Error: No response received."]);
    }
    setIsLoading(false);
  };



  return (
    <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-4">
          <LinkAsButton href={`/oasis/${listId}`}>Back</LinkAsButton>
          <div className="text-right">
            <p className="text-sm text-neutral-500">Oasis</p>
            <p className="text-base font-medium text-neutral-800">
              {meta?.name ?? "(Unnamed list)"}
              {meta?.language ? (
                <span className="ml-2 text-neutral-400">• {meta.language}</span>
              ) : null}
            </p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Story Generator Card */}
          <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-100 p-4 md:p-5">
              <h1 className="text-lg font-semibold tracking-tight md:text-xl">Story Generator</h1>
              <Button onClick={generateStory} className="px-4 py-2">
                Generate
              </Button>
            </div>
            <div className="p-4 md:p-5 space-y-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">Story</label>
                <textarea
                  className="h-[340px] w-full resize-none rounded-xl border border-neutral-200 bg-white/90 p-3 text-neutral-800 shadow-inner outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-400/60"
                  value={story}
                  readOnly
                  placeholder="Your generated story will appear here."
                />
              </div>
              <p className="text-xs text-neutral-500">
                Hint: Regenerate to refresh with your current vocabulary.
              </p>
            </div>
          </section>

          {/* Chat Card */}
          <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-100 p-4 md:p-5">
              <h2 className="text-lg font-semibold tracking-tight md:text-xl">Chat</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Ask about the story.
              </p>
            </div>
            <div className="p-4 md:p-5 space-y-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">Conversation</label>
                <textarea
                  className="h-[260px] w-full resize-none rounded-xl border border-neutral-200 bg-white/90 p-3 text-neutral-800 shadow-inner outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-400/60"
                  value={chatLog.join("\n")}
                  readOnly
                  placeholder="Messages will appear here."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  className="flex-1 rounded-full border border-neutral-200 bg-white/90 px-4 py-2 text-sm outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-400/60"
                  placeholder="Type your message…"
                />
                <Button onClick={sendChat} className="px-4 py-2" disabled={isLoading}>
                  {isLoading ? "Sending…" : "Send"}
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="mx-auto max-w-6xl pt-6">
        <div className="flex gap-3">
          <LinkAsButton href={`/oasis/${listId}`} className="btn">Back</LinkAsButton>
        </div>
        
      </div>
    </div>
  );
}
// This code defines a simple Next.js page that allows users to generate a story in a selected language
// and chat with a simulated Gemini-like API. It uses React hooks for state management and fetches data from an API endpoint.