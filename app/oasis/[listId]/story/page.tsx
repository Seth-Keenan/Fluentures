// "use client";
// import { useState } from "react";
// import { useOasisData } from "@/app/lib/hooks/useOasis";
// import { Button } from "@/app/components/Button";
// import { LinkAsButton } from "@/app/components/LinkAsButton";
// import { requestStory, sendStoryChat } from "@/app/lib/actions/geminiStoryAction";
// import type { HistoryItem } from "@/app/types/gemini";

// // typed helpers so role is "user" | "model"
// const toUser = (text: string): HistoryItem => ({ role: "user", parts: [{ text }] });
// const toModel = (text: string): HistoryItem => ({ role: "model", parts: [{ text }] });

// // helper: build a brief vocab prompt from your list
// function buildVocabHint(words: { target: string; english: string }[], max = 20) {
//   const trimmed = words.slice(0, max).map(w => `${w.target} = ${w.english}`).join(", ");
//   return trimmed ? `Use these vocabulary items where natural: ${trimmed}.` : "";
// }

// export default function StoryPage() {
//   const { listId, meta, words, loading } = useOasisData();

//   const [story, setStory] = useState("");
//   const [chatLog, setChatLog] = useState<string[]>([]);
//   const [chatInput, setChatInput] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [apiHistory, setApiHistory] = useState<HistoryItem[]>([]);

//   if (!listId) return <p className="p-6">Missing list id.</p>;
//   if (loading) return <p className="p-6">Loading oasis…</p>;

//   // Generate a new story, scoped to this oasis
//   const generateStory = async () => {
//     setStory("Generating…");
//     setChatLog([]);
//     setApiHistory([]);

//     // pass context to your server action
//     const vocabHint = buildVocabHint(words, 20);
//     const res = await requestStory({
//       listId,
//       language: meta?.language ?? undefined,
//       vocabHint,
//     });

//     const storyText =
//       typeof res === "string" ? res : res?.story ?? "Failed to generate story.";
//     setStory(storyText);
//   };

//   const sendChat = async () => {
//     if (!chatInput.trim() || isLoading) return;

//     setIsLoading(true);
//     const currentInput = chatInput;
//     setChatLog(prev => [...prev, `You: ${currentInput}`]);
//     setChatInput("");

//     const seededContext: HistoryItem[] = [
//       toUser(
//         `Here is the story for Oasis "${meta?.name ?? ""}" (id: ${listId}). Use the same language and reference these vocabulary items when helpful. Story: """${story}""". ${buildVocabHint(words, 20)}`
//       ),
//       toModel("Okay, I have the story and vocabulary. I will answer your questions about it."),
//     ];
//     const historyForApi = apiHistory.length === 0 ? seededContext : apiHistory;

//     const reply = await sendStoryChat(currentInput, historyForApi, { listId });
//     const replyText = typeof reply === "string" ? reply : reply?.text ?? null;

//     if (replyText) {
//       setChatLog(prev => [...prev, `Camel: ${replyText}`]);
//       setApiHistory([...historyForApi, toUser(currentInput), toModel(replyText)]);
//     } else {
//       setChatLog(prev => [...prev, "Error: No response received."]);
//     }
//     setIsLoading(false);
//   };



//   return (
//     <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
//       <div className="mx-auto max-w-6xl space-y-6">
//         {/* Top Bar */}
//         <div className="flex items-center justify-between gap-4">
//           <LinkAsButton href={`/oasis/${listId}`}>Back</LinkAsButton>
//           <div className="text-right">
//             <p className="text-sm text-neutral-500">Oasis</p>
//             <p className="text-base font-medium text-neutral-800">
//               {meta?.name ?? "(Unnamed list)"}
//               {meta?.language ? (
//                 <span className="ml-2 text-neutral-400">• {meta.language}</span>
//               ) : null}
//             </p>
//           </div>
//         </div>

//         {/* Main Grid */}
//         <div className="grid gap-6 md:grid-cols-2">
//           {/* Story Generator Card */}
//           <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
//             <div className="flex items-center justify-between border-b border-neutral-100 p-4 md:p-5">
//               <h1 className="text-lg font-semibold tracking-tight md:text-xl">Story Generator</h1>
//               <Button onClick={generateStory} className="px-4 py-2">
//                 Generate
//               </Button>
//             </div>
//             <div className="p-4 md:p-5 space-y-3">
//               <div>
//                 <label className="mb-2 block text-sm font-medium text-neutral-700">Story</label>
//                 <textarea
//                   className="h-[340px] w-full resize-none rounded-xl border border-neutral-200 bg-white/90 p-3 text-neutral-800 shadow-inner outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-400/60"
//                   value={story}
//                   readOnly
//                   placeholder="Your generated story will appear here."
//                 />
//               </div>
//               <p className="text-xs text-neutral-500">
//                 Hint: Regenerate to refresh with your current vocabulary.
//               </p>
//             </div>
//           </section>

//           {/* Chat Card */}
//           <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
//             <div className="border-b border-neutral-100 p-4 md:p-5">
//               <h2 className="text-lg font-semibold tracking-tight md:text-xl">Chat</h2>
//               <p className="mt-1 text-sm text-neutral-500">
//                 Ask about the story.
//               </p>
//             </div>
//             <div className="p-4 md:p-5 space-y-3">
//               <div>
//                 <label className="mb-2 block text-sm font-medium text-neutral-700">Conversation</label>
//                 <textarea
//                   className="h-[260px] w-full resize-none rounded-xl border border-neutral-200 bg-white/90 p-3 text-neutral-800 shadow-inner outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-400/60"
//                   value={chatLog.join("\n")}
//                   readOnly
//                   placeholder="Messages will appear here."
//                 />
//               </div>

//               <div className="flex items-center gap-2">
//                 <input
//                   value={chatInput}
//                   onChange={e => setChatInput(e.target.value)}
//                   className="flex-1 rounded-full border border-neutral-200 bg-white/90 px-4 py-2 text-sm outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-400/60"
//                   placeholder="Type your message…"
//                 />
//                 <Button onClick={sendChat} className="px-4 py-2" disabled={isLoading}>
//                   {isLoading ? "Sending…" : "Send"}
//                 </Button>
//               </div>
//             </div>
//           </section>
//         </div>
//       </div>
//     </div>
//   );
// }
// // This code defines a simple Next.js page that allows users to generate a story in a selected language
// // and chat with a simulated Gemini-like API. It uses React hooks for state management and fetches data from an API endpoint.

// app/oasis/story/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/app/components/Button";
import { LinkAsButton } from "@/app/components/LinkAsButton";
import { useOasisData } from "@/app/lib/hooks/useOasis";
import { requestStory, sendStoryChat } from "@/app/lib/actions/geminiStoryAction";
import type { HistoryItem } from "@/app/types/gemini";

/** typed helpers so role is "user" | "model" */
const toUser  = (text: string): HistoryItem => ({ role: "user",  parts: [{ text }] });
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
  const [isSending, setIsSending] = useState(false); // chat send state
  const [apiHistory, setApiHistory] = useState<HistoryItem[]>([]);
  const prefersReducedMotion = useReducedMotion();

  // auto-scroll chat to bottom
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chatLog]);

  if (!listId) return <p className="p-6">Missing list id.</p>;
  if (loading)  return <p className="p-6">Loading oasis…</p>;

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
            {/* subtle shine */}
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
              {/* shimmer while generating */}
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

            {/* Log */}
            <div className="relative flex-1 space-y-2 overflow-y-auto rounded-xl border border-white/15 bg-white/5 p-3">
              {chatLog.length === 0 ? (
                <p className="text-sm text-white/70">
                  Ask questions about the generated story. Press{" "}
                  <kbd className="rounded bg-white/20 px-1.5 py-0.5">Enter</kbd> to send,{" "}
                  <kbd className="rounded bg-white/20 px-1.5 py-0.5">Shift+Enter</kbd> for a new line.
                </p>
              ) : (
                chatLog.map((line, i) => {
                  const isYou = line.startsWith("You:");
                  const text = line.replace(/^You:\s?/, "").replace(/^Camel:\s?/, "");
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

            {/* Composer */}
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

// "use client";
// import { useEffect, useMemo, useRef, useState } from "react";
// import { motion, useReducedMotion } from "framer-motion";
// import { useSettings } from "@/app/lib/hooks/useSettings";
// import { Button } from "@/app/components/Button";
// import { LinkAsButton } from "@/app/components/LinkAsButton";
// import { requestStory, sendStoryChat } from "@/app/lib/actions/geminiStoryAction";
// import type { HistoryItem } from "@/app/types/gemini";

// // typed helpers so role is "user" | "model"
// const toUser = (text: string): HistoryItem => ({ role: "user", parts: [{ text }] });
// const toModel = (text: string): HistoryItem => ({ role: "model", parts: [{ text }] });

// export default function StoryPage() {
//   const { language, difficulty, isLoading: settingsLoading } = useSettings();
//   const [story, setStory] = useState("");
//   const [chatLog, setChatLog] = useState<string[]>([]);
//   const [chatInput, setChatInput] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [apiHistory, setApiHistory] = useState<HistoryItem[]>([]);
//   const prefersReducedMotion = useReducedMotion();

//   const chatEndRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
//   }, [chatLog]);

//   const headerSubtitle = useMemo(() => {
//     if (!language || !difficulty) return "";
//     return `Language: ${language} • Level: ${difficulty}`;
//   }, [language, difficulty]);

//   if (settingsLoading) {
//     return (
//       <div className="relative min-h-screen w-full overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-b from-amber-900/40 via-amber-800/30 to-stone-900/60" />
//         <div className="relative z-10 mx-auto w-[min(92vw,68rem)] p-6">
//           <div className="animate-pulse space-y-4">
//             <div className="h-12 w-64 rounded-xl bg-white/10" />
//             <div className="h-40 w-full rounded-2xl bg-white/10" />
//             <div className="h-40 w-full rounded-2xl bg-white/10" />
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!language || !difficulty) {
//     return <p className="p-6">Error loading settings. Please try refreshing.</p>;
//   }

//   // Generate a new story (server reads settings from DB)
//   const generateStory = async () => {
//     setStory("Generating...");
//     setChatLog([]);
//     setApiHistory([]); // reset chat context for the new story
//     const newStory = await requestStory();
//     // If newStory is an object with a 'story' property, use it; otherwise, use the string or fallback
//     const storyText =
//       typeof newStory === "string"
//         ? newStory
//         : newStory?.story ?? "Failed to generate story.";
//     setStory(storyText);
//   };

//   const sendChat = async () => {
//     if (!chatInput.trim() || isLoading) return;

//     setIsLoading(true);
//     const currentInput = chatInput;
//     setChatLog((prev) => [...prev, `You: ${currentInput}`]);
//     setChatInput("");

//     // Seed the story context once
//     const seededContext: HistoryItem[] = [
//       toUser(
//         `Here is a story. All my next questions will be about this story. Do not forget it. Story: """${story}"""`
//       ),
//       toModel("Okay, I have the story. I will answer your questions about it."),
//     ];

//     const historyForApi: HistoryItem[] = apiHistory.length === 0 ? seededContext : apiHistory;

//     const modelReply = await sendStoryChat(currentInput, historyForApi);
//     const replyText =
//       typeof modelReply === "string" ? modelReply : modelReply?.text ?? null;

//     if (replyText) {
//       setChatLog((prev) => [...prev, `Camel: ${replyText}`]);
//       setApiHistory([
//         ...historyForApi,
//         toUser(currentInput),
//         toModel(replyText),
//       ]);
//     } else {
//       setChatLog((prev) => [...prev, "Error: No response received."]);
//     }

//     setIsLoading(false);
//   };

//   const onEnterSend: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       sendChat();
//     }
//   };

//   return (
//     <div className="relative min-h-screen w-full overflow-hidden">
//       {/* Backdrop image (reuses oasis vibe) */}
//       <motion.img
//         src="/desert.png"
//         alt="Desert dunes"
//         className="absolute inset-0 h-full w-full object-cover"
//         initial={{ scale: 1 }}
//         animate={prefersReducedMotion ? { scale: 1 } : { scale: [1, 1.05, 1] }}
//         transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
//       />

//       {/* Aurora blobs */}
//       <motion.div
//         aria-hidden
//         className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl"
//         style={{
//           background:
//             "radial-gradient(60% 60% at 50% 50%, rgba(124,58,237,0.35), rgba(0,0,0,0))",
//         }}
//         animate={prefersReducedMotion ? { x: 0, y: 0 } : { y: [0, 18, 0], x: [0, 12, 0] }}
//         transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
//       />
//       <motion.div
//         aria-hidden
//         className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full blur-3xl"
//         style={{
//           background:
//             "radial-gradient(60% 60% at 50% 50%, rgba(236,72,153,0.28), rgba(0,0,0,0))",
//         }}
//         animate={prefersReducedMotion ? { x: 0, y: 0 } : { y: [0, -14, 0], x: [0, -10, 0] }}
//         transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
//       />

//       {/* Grain + contrast veil */}
//       <div
//         aria-hidden
//         className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-soft-light"
//         style={{
//           backgroundImage:
//             "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.35'/></svg>\")",
//           backgroundSize: "160px 160px",
//         }}
//       />
//       <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />

//       {/* Content shell */}
//       <div className="relative z-10 mx-auto w-[min(92vw,68rem)] p-4 pb-8">
//         <div className="mb-4 flex items-center justify-end">
//           <LinkAsButton href="/oasis" className="ring-1 ring-white/30 bg-white/20 text-white hover:bg-white/30">
//             Back
//           </LinkAsButton>
//         </div>

//         {/* Header card */}
//         <motion.div
//           initial={{ opacity: 0, y: 10, scale: 0.98 }}
//           animate={{ opacity: 1, y: 0, scale: 1 }}
//           transition={{ duration: 0.45 }}
//           className="mb-5 w-full rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl"
//         >
//           <div className="flex flex-col gap-1">
//             <h1 className="text-2xl font-semibold text-white drop-shadow">
//               Story Generator
//             </h1>
//             {headerSubtitle ? (
//               <p className="text-sm text-white/80">{headerSubtitle}</p>
//             ) : null}
//           </div>
//         </motion.div>

//         {/* Two columns: story + chat */}
//         <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
//           {/* Story panel */}
//           <motion.div
//             initial={{ opacity: 0, y: 8 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.35, delay: 0.05 }}
//             className="relative rounded-2xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-xl"
//           >
//             {/* subtle shine */}
//             <div
//               aria-hidden
//               className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 hover:opacity-100"
//               style={{
//                 background:
//                   "radial-gradient(1200px 300px at 0% -20%, rgba(255,255,255,0.12), transparent 60%)",
//               }}
//             />

//             <div className="mb-3 flex items-center justify-between">
//               <h2 className="text-lg font-semibold text-white">Story</h2>
//               <Button
//                 onClick={generateStory}
//                 disabled={isLoading}
//                 className="!py-1.5 !px-3 ring-1 ring-white/30 bg-white/20 text-white hover:bg-white/30"
//               >
//                 {story === "Generating..." ? "Generating…" : "Generate"}
//               </Button>
//             </div>

//             <div className="relative">
//               {/* shimmer placeholder when generating */}
//               {story === "Generating..." && (
//                 <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
//                   <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
//                   <div className="absolute -inset-x-1 -top-1 h-1/3 animate-pulse rounded-full bg-white/10 blur-xl" />
//                 </div>
//               )}

//               <textarea
//                 className="min-h-[18rem] w-full resize-none rounded-xl border border-white/20 bg-white/5 p-3 font-mono text-[13px] leading-relaxed text-white placeholder-white/60 outline-none ring-1 ring-white/20 focus:ring-2 focus:ring-white/60"
//                 value={story}
//                 readOnly
//                 placeholder="Generate a story to begin…"
//               />
//             </div>
//           </motion.div>

//           {/* Chat panel */}
//           <motion.div
//             initial={{ opacity: 0, y: 8 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.35, delay: 0.1 }}
//             className="relative flex min-h-[24rem] flex-col rounded-2xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-xl"
//           >
//             {/* Title */}
//             <div className="mb-3 flex items-center justify-between">
//               <h2 className="text-lg font-semibold text-white">Chat</h2>
//             </div>

//             {/* Log */}
//             <div className="custom-scrollbar relative flex-1 space-y-2 overflow-y-auto rounded-xl border border-white/15 bg-white/5 p-3">
//               {chatLog.length === 0 ? (
//                 <p className="text-sm text-white/70">
//                   Ask questions about the generated story. Press <kbd className="rounded bg-white/20 px-1.5 py-0.5">Enter</kbd> to send, <kbd className="rounded bg-white/20 px-1.5 py-0.5">Shift</kbd>+<kbd className="rounded bg-white/20 px-1.5 py-0.5">Enter</kbd> for a new line.
//                 </p>
//               ) : (
//                 chatLog.map((line, i) => {
//                   const isYou = line.startsWith("You:");
//                   const text = line.replace(/^You:\s?/, "").replace(/^Camel:\s?/, "");
//                   return (
//                     <div
//                       key={i}
//                       className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
//                         isYou
//                           ? "ml-auto bg-indigo-500/80 text-white"
//                           : "mr-auto bg-white/15 text-white"
//                       }`}
//                     >
//                       <span className="block text-[11px] opacity-80">
//                         {isYou ? "You" : "Camel"}
//                       </span>
//                       <span>{text}</span>
//                     </div>
//                   );
//                 })
//               )}
//               <div ref={chatEndRef} />
//             </div>

//             {/* Composer */}
//             <div className="mt-3 flex items-end gap-2">
//               <textarea
//                 value={chatInput}
//                 onChange={(e) => setChatInput(e.target.value)}
//                 onKeyDown={onEnterSend}
//                 rows={2}
//                 placeholder="Ask something about the story…"
//                 className="min-h-[3rem] flex-1 resize-y rounded-xl border border-white/20 bg-white/5 p-3 text-sm text-white placeholder-white/60 outline-none ring-1 ring-white/20 focus:ring-2 focus:ring-white/60"
//               />
//               <Button
//                 onClick={sendChat}
//                 disabled={isLoading || !chatInput.trim()}
//                 className="!py-2 !px-4 ring-1 ring-white/30 bg-white/20 text-white hover:bg-white/30 disabled:opacity-60"
//               >
//                 {isLoading ? "Sending…" : "Send"}
//               </Button>
//             </div>
//           </motion.div>
//         </div>

//         <p className="mt-4 text-center text-xs text-white/80">
//           Tip: Generate a fresh story, then quiz the “Camel” assistant with questions about it.
//         </p>
//       </div>
//     </div>
//   );
// }
// // This code defines a simple Next.js page that allows users to generate a story in a selected language
// // and chat with a simulated Gemini-like API. It uses React hooks for state management and fetches data from an API endpoint.
