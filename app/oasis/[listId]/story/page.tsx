"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/app/components/Button";
import { LinkAsButton } from "@/app/components/LinkAsButton";
import { useOasisData } from "@/app/lib/hooks/useOasis";
import { requestStory, sendStoryChat } from "@/app/lib/actions/geminiStoryAction";
import type { HistoryItem } from "@/app/types/gemini";

/** typed helpers so role is "user" | "model" */
const toUser = (text: string): HistoryItem => ({ role: "user", parts: [{ text }] });
const toModel = (text: string): HistoryItem => ({ role: "model", parts: [{ text }] });

/** helper: build a brief vocab prompt from your list */
function buildVocabHint(
  words: { target: string; english: string }[],
  max = 20
) {
  const trimmed = words
    .slice(0, max)
    .map((w) => `${w.target} = ${w.english}`)
    .join(", ");
  return trimmed ? `Use these vocabulary items where natural: ${trimmed}.` : "";
}

export default function StoryPage() {
  const { listId, meta, words, loading } = useOasisData();

  const [story, setStory] = useState("");
  const [chatLog, setChatLog] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [apiHistory, setApiHistory] = useState<HistoryItem[]>([]);
  const prefersReducedMotion = useReducedMotion();

  // auto-scroll chat to bottom
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chatLog]);

  if (!listId) return <div className="p-6 text-white">Missing list id.</div>;

  if (loading) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden">
        <motion.img
          src="/desert.png"
          alt="Desert dunes"
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ scale: 1 }}
          animate={prefersReducedMotion ? { scale: 1 } : { scale: [1, 1.05, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/55" />

        {!prefersReducedMotion && (
          <>
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl"
              style={{
                background:
                  "radial-gradient(60% 60% at 50% 50%, rgba(124,58,237,0.35), rgba(0,0,0,0))",
              }}
              animate={{ y: [0, 18, 0], x: [0, 12, 0] }}
              transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full blur-3xl"
              style={{
                background:
                  "radial-gradient(60% 60% at 50% 50%, rgba(236,72,153,0.28), rgba(0,0,0,0))",
              }}
              animate={{ y: [0, -16, 0], x: [0, -10, 0] }}
              transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
            />
          </>
        )}

        <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="w-[min(92vw,28rem)] rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl text-center"
          >
            <div className="inline-flex items-center justify-center rounded-full bg-white/15 px-4 py-2 text-xs font-medium text-white/90 ring-1 ring-white/25">
              Preparing your oasis…
            </div>

            <h1 className="mt-4 text-2xl font-semibold text-white">
              Loading your story
            </h1>
            <p className="mt-2 text-sm text-white/80">
              We&apos;re crafting a tale based on the vocabulary in this oasis.
            </p>

            <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-white/10 ring-1 ring-white/20">
              <div className="h-full w-1/3 animate-[storyStripe_1.4s_infinite] rounded-full bg-gradient-to-r from-white/40 via-white/90 to-white/40" />
            </div>

            <div className="mt-6 flex flex-col items-center gap-3 text-xs text-white/75">
              <span className="h-6 w-6 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
              <p>Tip: after it loads, ask the chat to simplify or extend the story.</p>
            </div>
          </motion.div>
        </div>

        <style jsx>{`
          @keyframes storyStripe {
            0% {
              transform: translateX(-120%);
            }
            100% {
              transform: translateX(260%);
            }
          }
        `}</style>
      </div>
    );
  }

  // Generate a new story, scoped to this oasis
  const generateStory = async () => {
    setStory("Generating...");
    setChatLog([]);
    setApiHistory([]);

    const vocabHint = buildVocabHint(
      words.map((w) => ({
        target: (w.target ?? "").trim(),
        english: (w.english ?? "").trim(),
      }))
    );

    const res = await requestStory({
      listId,
      language: meta?.language ?? undefined,
      vocabHint,
    });

    const storyText =
      typeof res === "string" ? res : res?.story ?? "Failed to generate story.";
    setStory(storyText);
  };

  // Chat (seeds the story & vocab context on first send)
  const sendChat = async () => {
    if (!chatInput.trim() || isSending) return;

    setIsSending(true);
    const currentInput = chatInput.trim();
    setChatLog((prev) => [...prev, `You: ${currentInput}`]);
    setChatInput("");

    const vocabHint = buildVocabHint(
      words.map((w) => ({
        target: (w.target ?? "").trim(),
        english: (w.english ?? "").trim(),
      }))
    );

    const seededContext: HistoryItem[] = [
      toUser(
        `Here is the story for Oasis "${meta?.name ?? ""}" (id: ${listId}). Use the same language and reference these vocabulary items when helpful. Story: """${story}""". ${vocabHint}`
      ),
      toModel(
        "Okay, I have the story and vocabulary. I will answer your questions about it."
      ),
    ];

    const historyForApi = apiHistory.length === 0 ? seededContext : apiHistory;

    const reply = await sendStoryChat(currentInput, historyForApi, { listId });
    const replyText = typeof reply === "string" ? reply : reply?.text ?? null;

    if (replyText) {
      setChatLog((prev) => [...prev, `Camel: ${replyText}`]);
      setApiHistory([
        ...historyForApi,
        toUser(currentInput),
        toModel(replyText),
      ]);
    } else {
      setChatLog((prev) => [...prev, "Error: No response received."]);
    }
    setIsSending(false);
  };

  const onEnterSend: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendChat();
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Backdrop image (oasis vibe) */}
      <motion.img
        src="/desert.png"
        alt="Desert dunes"
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ scale: 1 }}
        animate={prefersReducedMotion ? { scale: 1 } : { scale: [1, 1.05, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Aurora blobs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, rgba(124,58,237,0.35), rgba(0,0,0,0))",
        }}
        animate={prefersReducedMotion ? { x: 0, y: 0 } : { y: [0, 18, 0], x: [0, 12, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, rgba(236,72,153,0.28), rgba(0,0,0,0))",
        }}
        animate={prefersReducedMotion ? { x: 0, y: 0 } : { y: [0, -14, 0], x: [0, -10, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Grain + contrast veil */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.35'/></svg>\")",
          backgroundSize: "160px 160px",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />

      {/* Content shell */}
      <div className="relative z-10 mx-auto w-[min(92vw,68rem)] p-4 pb-8">
        {/* Top bar */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-white/85 text-sm">
            {meta?.name ?? "(Unnamed list)"}{" "}
            {meta?.language ? (
              <span className="opacity-70">• {meta.language}</span>
            ) : null}
          </div>
          <LinkAsButton
            href={`/oasis/${listId}`}
            className="ring-1 ring-white/30 bg-white/20 text-white hover:bg-white/30"
          >
            Back
          </LinkAsButton>
        </div>

        {/* Header card */}
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45 }}
          className="mb-5 w-full rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-white drop-shadow">
              Story Generator
            </h1>
            <p className="text-sm text-white/80">
              Create a short tale using your oasis vocabulary, then ask questions.
            </p>
          </div>
        </motion.div>

        {/* Two columns: story + chat */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Story panel */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="relative rounded-2xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-xl"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 hover:opacity-100"
              style={{
                background:
                  "radial-gradient(1200px 300px at 0% -20%, rgba(255,255,255,0.12), transparent 60%)",
              }}
            />

            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Story</h2>
              <Button
                onClick={generateStory}
                className="!py-1.5 !px-3 ring-1 ring-white/30 bg-white/20 text-white hover:bg-white/30"
              >
                {story === "Generating..." ? "Generating…" : "Generate"}
              </Button>
            </div>

            <div className="relative">
              {story === "Generating..." && (
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
                  <div className="absolute -inset-x-1 -top-1 h-1/3 animate-pulse rounded-full bg-white/10 blur-xl" />
                </div>
              )}

              <textarea
                className="min-h-[18rem] w-full resize-none rounded-xl border border-white/20 bg-white/5 p-3 font-mono text-[13px] leading-relaxed text-white placeholder-white/60 outline-none ring-1 ring-white/20 focus:ring-2 focus:ring-white/60"
                value={story}
                readOnly
                placeholder="Generate a story to begin…"
              />
            </div>
          </motion.div>

          {/* Chat panel */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="relative flex min-h-[24rem] flex-col rounded-2xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Chat</h2>
            </div>

            <div className="relative flex-1 space-y-2 overflow-y-auto rounded-xl border border-white/15 bg-white/5 p-3">
              {chatLog.length === 0 ? (
                <p className="text-sm text-white/70">
                  Ask questions about the generated story. Press{" "}
                  <kbd className="rounded bg-white/20 px-1.5 py-0.5">Enter</kbd> to send,{" "}
                  <kbd className="rounded bg-white/20 px-1.5 py-0.5">Shift+Enter</kbd> for a
                  new line.
                </p>
              ) : (
                chatLog.map((line, i) => {
                  const isYou = line.startsWith("You:");
                  const text = line
                    .replace(/^You:\s?/, "")
                    .replace(/^Camel:\s?/, "");
                  return (
                    <div
                      key={i}
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                        isYou
                          ? "ml-auto bg-indigo-500/80 text-white"
                          : "mr-auto bg-white/15 text-white"
                      }`}
                    >
                      <span className="block text-[11px] opacity-80">
                        {isYou ? "You" : "Camel"}
                      </span>
                      <span>{text}</span>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="mt-3 flex items-end gap-2">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={onEnterSend}
                rows={2}
                placeholder="Ask something about the story…"
                className="min-h-[3rem] flex-1 resize-y rounded-xl border border-white/20 bg-white/5 p-3 text-sm text-white placeholder-white/60 outline-none ring-1 ring-white/20 focus:ring-2 focus:ring-white/60"
              />
              <Button
                onClick={sendChat}
                disabled={isSending || !chatInput.trim()}
                className="!py-2 !px-4 ring-1 ring-white/30 bg-white/20 text-white hover:bg-white/30 disabled:opacity-60"
              >
                {isSending ? "Sending…" : "Send"}
              </Button>
            </div>
          </motion.div>
        </div>

        <p className="mt-4 text-center text-xs text-white/80">
          Tip: Generate a fresh story, then quiz the “Camel” assistant with questions about it.
        </p>
      </div>
    </div>
  );
}
