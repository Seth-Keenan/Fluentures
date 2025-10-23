// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { Button } from "@/app/components/Button";
// import { LinkAsButton } from "@/app/components/LinkAsButton";
// import { useOasisData } from "@/app/lib/hooks/useOasis";
// import { requestSentence, sendSentenceChat } from "@/app/lib/actions/geminiSentenceAction";

// // Minimal history type (matches your API)
// type HistoryItem = { role: "user" | "model"; parts: { text: string }[] };
// const toUser = (text: string): HistoryItem => ({ role: "user", parts: [{ text }] });
// const toModel = (text: string): HistoryItem => ({ role: "model", parts: [{ text }] });

// export default function SentencesPage() {
//   const { listId, meta, words, loading } = useOasisData();

//   // derive the target tokens from the oasis list
//   const targets = useMemo(() => words.map(w => (w.target ?? "").trim()).filter(Boolean), [words]);

//   const [sentences, setSentences] = useState<Record<string, string>>({});
//   const [chatLog, setChatLog] = useState<string[]>([]);
//   const [chatInput, setChatInput] = useState("");
//   const [apiHistory, setApiHistory] = useState<HistoryItem[]>([]);
//   const [generating, setGenerating] = useState(false);

//   useEffect(() => {
//     if (!listId || loading) return;
//     // generate once when data arrives
//     (async () => {
//       setGenerating(true);
//       for (const word of targets) {
//         setSentences(prev => ({ ...prev, [word]: "Generating..." }));
//         const s = await requestSentence({ listId, word, language: meta?.language ?? undefined });
//         setSentences(prev => ({ ...prev, [word]: s || " Error generating sentence" }));
//       }
//       setGenerating(false);
//     })();
//   }, [listId, loading, targets, meta?.language]);

//   const regenerateOne = async (word: string) => {
//     if (!listId) return;
//     setSentences(prev => ({ ...prev, [word]: "Generating..." }));
//     const s = await requestSentence({ listId, word, language: meta?.language ?? undefined });
//     setSentences(prev => ({ ...prev, [word]: s || " Error generating sentence" }));
//   };

//   const sendChat = async () => {
//     if (!chatInput.trim() || !listId) return;

//     const userMsg = chatInput.trim();
//     setChatLog(prev => [...prev, `You: ${userMsg}`]);
//     setChatInput("");

//     const history = [...apiHistory, toUser(userMsg)];
//     const reply = await sendSentenceChat(userMsg, history, { listId });
//     const replyText = reply?.text ?? null;

//     if (replyText) {
//       setChatLog(prev => [...prev, `Gemini: ${replyText}`]);
//       setApiHistory([...history, toModel(replyText)]);
//     } else {
//       setChatLog(prev => [...prev, "Gemini: Chat failed"]);
//     }
//   };

//   if (!listId) return <div className="p-6">Missing list id.</div>;
//   if (loading) return <div className="p-6">Loading oasis…</div>;


//   return (
//   <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
//     <div className="mx-auto max-w-6xl space-y-6">
//       {/* Top Bar */}
//       <div className="flex items-center justify-between gap-4">
//         <LinkAsButton href={`/oasis/${listId}`}>Back</LinkAsButton>
//         <div className="text-right">
//           <p className="text-sm text-neutral-500">Oasis</p>
//           <p className="text-base font-medium text-neutral-800">
//             {meta?.name ?? "Oasis"}
//             <span className="ml-2 text-neutral-400">
//               • {meta?.language ?? "—"} • {targets.length} words
//             </span>
//           </p>
//         </div>
//       </div>

//       {/* Main Grid */}
//       <div className="grid gap-6 md:grid-cols-2">
//         {/* LEFT: Sentences List */}
//         <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
//           <div className="border-b border-neutral-100 p-4 md:p-5">
//             <h1 className="text-lg font-semibold tracking-tight md:text-xl">
//               Example Sentences
//             </h1>
//             <p className="mt-1 text-sm text-neutral-500">
//               Language: {meta?.language ?? "—"} · Words: {targets.length}
//             </p>
//           </div>

//           <div className="p-4 md:p-5 space-y-4">
//             {targets.length === 0 && (
//               <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
//                 No words yet. Add some in <span className="font-medium">Edit Oasis</span>.
//               </div>
//             )}

//             {targets.map((word) => (
//               <div key={word} className="rounded-xl border border-neutral-200 p-4">
//                 <p className="font-semibold text-neutral-800">{word}</p>
//                 <textarea
//                   className="mt-2 h-32 w-full resize-none rounded-xl border border-neutral-200 bg-white/90 p-3 text-neutral-800 shadow-inner outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-400/60"
//                   value={
//                     sentences[word] ||
//                     (generating ? "Generating..." : "No sentence yet")
//                   }
//                   readOnly
//                 />
//                 <Button
//                   className="mt-3 px-4 py-2"
//                   onClick={() => regenerateOne(word)}
//                   disabled={generating}
//                 >
//                   🔄 Regenerate
//                 </Button>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* RIGHT: Chat Section */}
//         <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
//           <div className="border-b border-neutral-100 p-4 md:p-5">
//             <h2 className="text-lg font-semibold tracking-tight md:text-xl">Chat</h2>
//             <p className="mt-1 text-sm text-neutral-500">
//               Ask about the sentences or request variations.
//             </p>
//           </div>

//           <div className="p-4 md:p-5">
//             <label className="mb-2 block text-sm font-medium text-neutral-700">
//               Conversation
//             </label>
//             <textarea
//               className="h-64 w-full resize-none rounded-xl border border-neutral-200 bg-white/90 p-3 text-neutral-800 shadow-inner outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-400/60"
//               value={chatLog.join("\n")}
//               readOnly
//               placeholder="Messages will appear here."
//             />

//             <div className="mt-3 flex items-center gap-2">
//               <input
//                 value={chatInput}
//                 onChange={(e) => setChatInput(e.target.value)}
//                 className="flex-1 rounded-full border border-neutral-200 bg-white/90 px-4 py-2 text-sm outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-400/60"
//                 placeholder="Ask about the sentences..."
//               />
//               <Button className="px-4 py-2" onClick={sendChat}>
//                 Send
//               </Button>
//             </div>
//           </div>
//         </section>
//       </div>
//     </div>
//   </div>
// );

// }

// app/oasis/sentences/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/app/components/Button";
import { LinkAsButton } from "@/app/components/LinkAsButton";
import { useOasisData } from "@/app/lib/hooks/useOasis";
import { requestSentence, sendSentenceChat } from "@/app/lib/actions/geminiSentenceAction";

/** Minimal history type (matches your API) */
type HistoryItem = { role: "user" | "model"; parts: { text: string }[] };
const toUser  = (text: string): HistoryItem => ({ role: "user",  parts: [{ text }] });
const toModel = (text: string): HistoryItem => ({ role: "model", parts: [{ text }] });

export default function SentencesPage() {
  const { listId, meta, words, loading } = useOasisData();

  // Targets from oasis
  const targets = useMemo(
    () => words.map(w => (w.target ?? "").trim()).filter(Boolean),
    [words]
  );

  // Sentence gen state
  const [sentences, setSentences] = useState<Record<string, string>>({});
  const [busyFor, setBusyFor] = useState<string | null>(null); // which word is generating
  const [initializing, setInitializing] = useState(true);

  // Chat state
  const [chatLog, setChatLog] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [apiHistory, setApiHistory] = useState<HistoryItem[]>([]);
  const [isSending, setIsSending] = useState(false);

  // UX niceties
  const prefersReducedMotion = useReducedMotion();
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chatLog]);

  // Generate a sentence for a given word (server reads settings + list)
  const generateSentence = async (word: string) => {
    if (!listId) return;
    setBusyFor(word);
    setSentences(prev => ({ ...prev, [word]: "Generating..." }));
    try {
      const s = await requestSentence({
        listId,
        word,
        language: meta?.language ?? undefined,
      });
      setSentences(prev => ({
        ...prev,
        [word]: s || " Error generating sentence",
      }));
    } catch (err) {
      console.error("Sentence request failed:", err);
      setSentences(prev => ({ ...prev, [word]: "Request failed" }));
    } finally {
      setBusyFor(null);
    }
  };

  // Initial load: generate all sentences when oasis is ready
  useEffect(() => {
    if (!listId || loading) return;
    (async () => {
      setInitializing(true);
      for (const w of targets) {
        await generateSentence(w);
      }
      setInitializing(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId, loading, targets.join(","), meta?.language]);

  // Chat (server action, keeps history shape)
  const sendChat = async () => {
    if (!chatInput.trim() || !listId || isSending) return;

    const userMsg = chatInput.trim();
    setChatLog(prev => [...prev, `You: ${userMsg}`]);
    setChatInput("");

    const history = [...apiHistory, toUser(userMsg)];
    setIsSending(true);
    try {
      const reply = await sendSentenceChat(userMsg, history, { listId });
      const replyText = reply?.text ?? null;
      if (replyText) {
        setChatLog(prev => [...prev, `Gemini: ${replyText}`]);
        setApiHistory([...history, toModel(replyText)]);
      } else {
        setChatLog(prev => [...prev, "Gemini: Chat failed"]);
      }
    } catch (err) {
      console.error("Chat failed:", err);
      setChatLog(prev => [...prev, "Gemini: Chat failed"]);
    } finally {
      setIsSending(false);
    }
  };

  const onEnterSend: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendChat();
    }
  };

  if (!listId) return <div className="p-6">Missing list id.</div>;
  if (loading)  return <div className="p-6">Loading oasis…</div>;

  const headerSubtitle = (() => {
    const done = Object.values(sentences).filter(Boolean).length;
    return `${done}/${targets.length} sentences ready`;
  })();

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background image + subtle motion */}
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
            "radial-gradient(60% 60% at 50% 50%, rgba(99,102,241,0.35), rgba(0,0,0,0))",
        }}
        animate={prefersReducedMotion ? { x: 0, y: 0 } : { y: [0, 18, 0], x: [0, 12, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-28 -right-24 h-96 w-96 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, rgba(236,72,153,0.28), rgba(0,0,0,0))",
        }}
        animate={prefersReducedMotion ? { x: 0, y: 0 } : { y: [0, -16, 0], x: [0, -10, 0] }}
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
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/55" />

      {/* Content shell */}
      <div className="relative z-10 mx-auto w-[min(92vw,68rem)] p-4 pb-8">
        {/* Top bar */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="text-white/80 text-sm">
            {meta?.name ?? "Oasis"} <span className="opacity-70">• {meta?.language ?? "—"} • {targets.length} words</span>
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
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-white drop-shadow">Example Sentences</h1>
              <p className="text-sm text-white/80">{headerSubtitle}</p>
            </div>
            {initializing ? (
              <div className="h-8 w-28 animate-pulse rounded-lg bg-white/20" />
            ) : null}
          </div>
        </motion.div>

        {/* Two columns */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* LEFT: Sentences List */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="relative rounded-2xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-xl"
          >
            {/* hover shine */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 hover:opacity-100"
              style={{
                background:
                  "radial-gradient(1200px 300px at 0% -20%, rgba(255,255,255,0.12), transparent 60%)",
              }}
            />

            {targets.length === 0 ? (
              <div className="rounded-xl border border-white/15 bg-white/5 p-4 text-sm text-white/85">
                No words yet. Add some in <span className="font-medium">Edit Oasis</span>.
              </div>
            ) : (
              <div className="space-y-4">
                {targets.map((word) => {
                  const value = sentences[word] || (initializing ? "Loading..." : "No sentence yet");
                  const isBusy = busyFor === word || value === "Generating...";
                  return (
                    <motion.div
                      key={word}
                      whileHover={{ y: -2 }}
                      transition={{ type: "spring", stiffness: 250, damping: 20 }}
                      className="relative overflow-hidden rounded-xl border border-white/15 bg-white/5 p-3 ring-1 ring-white/20"
                    >
                      {/* shimmer overlay when generating */}
                      {isBusy && (
                        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
                          <div className="absolute -inset-x-1 -top-1 h-1/3 animate-pulse rounded-full bg-white/10 blur-xl" />
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-white">{word}</p>
                        <Button
                          className="!py-1.5 !px-3 ring-1 ring-white/30 bg-white/20 text-white hover:bg-white/30 disabled:opacity-60"
                          onClick={() => generateSentence(word)}
                          disabled={isBusy}
                          aria-label={`Regenerate sentence for ${word}`}
                        >
                          {isBusy ? "Generating…" : "🔄 Regenerate"}
                        </Button>
                      </div>

                      <textarea
                        className="mt-2 w-full min-h-[6.5rem] resize-none rounded-lg border border-white/15 bg-white/5 p-2 text-sm text-white outline-none ring-1 ring-white/20 focus:ring-2 focus:ring-white/60"
                        value={value}
                        readOnly
                      />
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* RIGHT: Chat Section */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="relative flex min-h-[26rem] flex-col rounded-2xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Chat</h2>
            </div>

            {/* Log */}
            <div className="relative flex-1 space-y-2 overflow-y-auto rounded-xl border border-white/15 bg-white/5 p-3">
              {chatLog.length === 0 ? (
                <p className="text-sm text-white/70">
                  Ask about the generated sentences. Press{" "}
                  <kbd className="rounded bg-white/20 px-1.5 py-0.5">Enter</kbd> to send,{" "}
                  <kbd className="rounded bg-white/20 px-1.5 py-0.5">Shift+Enter</kbd> for a new line.
                </p>
              ) : (
                chatLog.map((line, i) => {
                  const isYou = line.startsWith("You:");
                  const text = line.replace(/^You:\s?/, "").replace(/^Gemini:\s?/, "");
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
                        {isYou ? "You" : "Gemini"}
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
                placeholder="Ask about the sentences..."
                className="min-h-[3rem] flex-1 resize-y rounded-xl border border-white/20 bg-white/5 p-3 text-sm text-white placeholder-white/60 outline-none ring-1 ring-white/20 focus:ring-2 focus:ring-white/60"
              />
              <Button
                className="!py-2 !px-4 ring-1 ring-white/30 bg-white/20 text-white hover:bg-white/30 disabled:opacity-60"
                onClick={sendChat}
                disabled={isSending || !chatInput.trim()}
              >
                {isSending ? "Sending…" : "Send"}
              </Button>
            </div>
          </motion.div>
        </div>

        <p className="mt-4 text-center text-xs text-white/80">
          Tip: Regenerate tricky words and ask the chat to compare or simplify the sentences.
        </p>
      </div>
    </div>
  );
}

// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import { motion, useReducedMotion } from "framer-motion";
// import { Button } from "@/app/components/Button";
// import { LinkAsButton } from "@/app/components/LinkAsButton";
// import { useOasis } from "@/app/context/OasisContext";

// // TODO: replace demo list


// const wordList = ["りんご", "ねこ", "いぬ", "みず", "やま"];

// // Minimal history type that matches your API's expected shape
// type HistoryItem = {
//   role: "user" | "model";
//   parts: { text: string }[];
// };
// const toUser = (text: string): HistoryItem => ({ role: "user", parts: [{ text }] });
// const toModel = (text: string): HistoryItem => ({ role: "model", parts: [{ text }] });

// export default function SentencesPage() {
//   const { oasisId, setOasisId } = useOasis();
//   const [sentences, setSentences] = useState<Record<string, string>>({});
//   const [chatLog, setChatLog] = useState<string[]>([]);
//   const [chatInput, setChatInput] = useState("");
//   const [apiHistory, setApiHistory] = useState<HistoryItem[]>([]);
//   const [busyFor, setBusyFor] = useState<string | null>(null); // which word is (re)generating
//   const [initializing, setInitializing] = useState(true);
//   const [isSending, setIsSending] = useState(false);

//   const prefersReducedMotion = useReducedMotion();
//   const chatEndRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
//   }, [chatLog]);

//   // Generate a sentence for a given word (server reads settings)
//   const generateSentence = async (word: string) => {
//     setBusyFor(word);
//     setSentences((prev) => ({ ...prev, [word]: "Generating..." }));
//     try {
//       const res = await fetch("/api/sentences", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({
//           action: "generate",
//           word,
//         }),
//       });

//       const data = await res.json();
//       setSentences((prev) => ({
//         ...prev,
//         [word]: data?.sentence || " Error generating sentence",
//       }));
//     } catch (err) {
//       console.error("Sentence fetch failed:", err);
//       setSentences((prev) => ({ ...prev, [word]: "Request failed" }));
//     } finally {
//       setBusyFor(null);
//       setInitializing(false);
//     }
//   };

//   // Initial load: generate all sentences
//   useEffect(() => {
//     (async () => {
//       setInitializing(true);
//       for (const w of wordList) {
//         await generateSentence(w);
//       }
//       setInitializing(false);
//     })();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Chat (server reads settings)
//   const sendChat = async () => {
//     if (!chatInput.trim() || isSending) return;

//     const userMsg = chatInput.trim();
//     setChatLog((prev) => [...prev, `You: ${userMsg}`]);
//     setChatInput("");

//     // Append user message to API history
//     const newHistory = [...apiHistory, toUser(userMsg)];
//     setIsSending(true);

//     try {
//       const res = await fetch("/api/sentences", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({
//           action: "chat",
//           input: userMsg,
//           history: newHistory, // properly typed history
//         }),
//       });

//       const data = await res.json();
//       const replyText: string | null =
//         typeof data?.reply === "string" ? data.reply : null;

//       if (replyText) {
//         setChatLog((prev) => [...prev, `Gemini: ${replyText}`]);
//         setApiHistory([...newHistory, toModel(replyText)]);
//       } else {
//         setChatLog((prev) => [...prev, "Gemini: Chat failed"]);
//       }
//     } catch (err) {
//       console.error("Chat request failed:", err);
//       setChatLog((prev) => [...prev, "Gemini: Chat failed"]);
//     } finally {
//       setIsSending(false);
//     }
//   };

//   const onEnterSend: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       sendChat();
//     }
//   };

//   const headerSubtitle = useMemo(() => {
//     const done = Object.values(sentences).filter(Boolean).length;
//     return `${done}/${wordList.length} sentences ready`;
//   }, [sentences]);

//   return (
//     <div className="relative min-h-screen w-full overflow-hidden">
//       {/* Background image */}
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
//             "radial-gradient(60% 60% at 50% 50%, rgba(99,102,241,0.35), rgba(0,0,0,0))",
//         }}
//         animate={prefersReducedMotion ? { x: 0, y: 0 } : { y: [0, 18, 0], x: [0, 12, 0] }}
//         transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
//       />
//       <motion.div
//         aria-hidden
//         className="pointer-events-none absolute -bottom-28 -right-24 h-96 w-96 rounded-full blur-3xl"
//         style={{
//           background:
//             "radial-gradient(60% 60% at 50% 50%, rgba(236,72,153,0.28), rgba(0,0,0,0))",
//         }}
//         animate={prefersReducedMotion ? { x: 0, y: 0 } : { y: [0, -16, 0], x: [0, -10, 0] }}
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
//       <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/55" />

//       {/* Content shell */}
//       <div className="relative z-10 mx-auto w-[min(92vw,68rem)] p-4 pb-8">
//         <div className="mb-4 flex items-center justify-end">
//           <LinkAsButton
//             href="/oasis"
//             className="ring-1 ring-white/30 bg-white/20 text-white hover:bg-white/30"
//           >
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
//           <div className="flex items-center justify-between gap-3">
//             <div>
//               <h1 className="text-2xl font-semibold text-white drop-shadow">
//                 Example Sentences
//               </h1>
//               <p className="text-sm text-white/80">{headerSubtitle}</p>
//             </div>
//             {initializing ? (
//               <div className="h-8 w-28 animate-pulse rounded-lg bg-white/20" />
//             ) : null}
//           </div>
//         </motion.div>

//         {/* Two columns */}
//         <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
//           {/* LEFT: Sentences List */}
//           <motion.div
//             initial={{ opacity: 0, y: 8 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.35, delay: 0.05 }}
//             className="relative rounded-2xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-xl"
//           >
//             {/* hover shine */}
//             <div
//               aria-hidden
//               className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 hover:opacity-100"
//               style={{
//                 background:
//                   "radial-gradient(1200px 300px at 0% -20%, rgba(255,255,255,0.12), transparent 60%)",
//               }}
//             />

//             <div className="space-y-4">
//               {wordList.map((word) => {
//                 const value = sentences[word] || "Loading...";
//                 const isBusy = busyFor === word || value === "Generating...";
//                 return (
//                   <motion.div
//                     key={word}
//                     whileHover={{ y: -2 }}
//                     transition={{ type: "spring", stiffness: 250, damping: 20 }}
//                     className="relative overflow-hidden rounded-xl border border-white/15 bg-white/5 p-3 ring-1 ring-white/20"
//                   >
//                     {/* shimmer overlay when generating */}
//                     {isBusy && (
//                       <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
//                         <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
//                         <div className="absolute -inset-x-1 -top-1 h-1/3 animate-pulse rounded-full bg-white/10 blur-xl" />
//                       </div>
//                     )}

//                     <div className="flex items-center justify-between">
//                       <p className="font-semibold text-white">{word}</p>
//                       <Button
//                         className="!py-1.5 !px-3 ring-1 ring-white/30 bg-white/20 text-white hover:bg-white/30 disabled:opacity-60"
//                         onClick={() => generateSentence(word)}
//                         disabled={isBusy}
//                       >
//                         {isBusy ? "Generating…" : "🔄 Regenerate"}
//                       </Button>
//                     </div>

//                     <textarea
//                       className="mt-2 w-full min-h-[6.5rem] resize-none rounded-lg border border-white/15 bg-white/5 p-2 text-sm text-white outline-none ring-1 ring-white/20 focus:ring-2 focus:ring-white/60"
//                       value={value}
//                       readOnly
//                     />
//                   </motion.div>
//                 );
//               })}
//             </div>
//           </motion.div>

//           {/* RIGHT: Chat Section */}
//           <motion.div
//             initial={{ opacity: 0, y: 8 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.35, delay: 0.1 }}
//             className="relative flex min-h-[26rem] flex-col rounded-2xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-xl"
//           >
//             <div className="mb-3 flex items-center justify-between">
//               <h2 className="text-lg font-semibold text-white">Chat</h2>
//             </div>

//             {/* Log */}
//             <div className="custom-scrollbar relative flex-1 space-y-2 overflow-y-auto rounded-xl border border-white/15 bg-white/5 p-3">
//               {chatLog.length === 0 ? (
//                 <p className="text-sm text-white/70">
//                   Ask about the generated sentences. Press{" "}
//                   <kbd className="rounded bg-white/20 px-1.5 py-0.5">Enter</kbd> to send,
//                   <span className="mx-1" />
//                   <kbd className="rounded bg-white/20 px-1.5 py-0.5">Shift</kbd>+
//                   <kbd className="rounded bg-white/20 px-1.5 py-0.5">Enter</kbd> for a new line.
//                 </p>
//               ) : (
//                 chatLog.map((line, i) => {
//                   const isYou = line.startsWith("You:");
//                   const text = line.replace(/^You:\s?/, "").replace(/^Gemini:\s?/, "");
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
//                         {isYou ? "You" : "Gemini"}
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
//                 placeholder="Ask about the sentences..."
//                 className="min-h-[3rem] flex-1 resize-y rounded-xl border border-white/20 bg-white/5 p-3 text-sm text-white placeholder-white/60 outline-none ring-1 ring-white/20 focus:ring-2 focus:ring-white/60"
//               />
//               <Button
//                 className="!py-2 !px-4 ring-1 ring-white/30 bg-white/20 text-white hover:bg-white/30 disabled:opacity-60"
//                 onClick={sendChat}
//                 disabled={isSending || !chatInput.trim()}
//               >
//                 {isSending ? "Sending…" : "Send"}
//               </Button>
//             </div>
//           </motion.div>
//         </div>

//         <p className="mt-4 text-center text-xs text-white/80">
//           Tip: Regenerate tricky words and ask the chat to compare or simplify the sentences.
//         </p>
//       </div>
//     </div>
//   );
// }
