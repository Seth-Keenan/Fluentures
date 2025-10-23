// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { Button } from "@/app/components/Button";
// import { useOasisData } from "@/app/lib/hooks/useOasis";
// import { requestQuizSentence } from "@/app/lib/actions/geminiQuizAction";

// type Mode = "en-to-target" | "target-to-en";

// export default function QuizPage() {
//   const { listId, meta, words, loading } = useOasisData();

//   // Build quiz pool from the oasis words
//   const pool = useMemo(
//     () => words.map(w => ({ target: (w.target ?? "").trim(), english: (w.english ?? "").trim() }))
//                .filter(w => w.target && w.english),
//     [words]
//   );

//   const [mode, setMode] = useState<Mode>("en-to-target");
//   const [questionCount, setQuestionCount] = useState(5);
//   const [quizStarted, setQuizStarted] = useState(false);

//   const [quizWords, setQuizWords] = useState<typeof pool>([]);
//   const [currentQuestion, setCurrentQuestion] = useState(0);
//   const [input, setInput] = useState("");
//   const [answerSubmitted, setAnswerSubmitted] = useState(false);
//   const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
//   const [score, setScore] = useState(0);

//   const [exampleSentence, setExampleSentence] = useState<string | null>(null);
//   const [sentenceLoading, setSentenceLoading] = useState(false);

//   const [mounted, setMounted] = useState(false);
//   useEffect(() => setMounted(true), []);

//   if (!mounted) return <p className="p-6">Loading…</p>;
//   if (!listId) return <div className="p-6">Missing list id.</div>;
//   if (loading) return <div className="p-6">Loading oasis…</div>;

//   const startQuiz = () => {
//     const shuffled = [...pool].sort(() => Math.random() - 0.5);
//     setQuizWords(shuffled.slice(0, Math.min(questionCount, shuffled.length)));
//     setCurrentQuestion(0);
//     setScore(0);
//     setInput("");
//     setAnswerSubmitted(false);
//     setIsCorrect(null);
//     setExampleSentence(null);
//     setQuizStarted(true);
//   };

//   // simple normalization
//   const norm = (s: string) => s.trim().toLowerCase();

//   const checkAnswer = () => {
//     const current = quizWords[currentQuestion];
//     const correctAnswer = mode === "en-to-target" ? current.target : current.english;
//     const isRight = norm(input) === norm(correctAnswer);
//     setIsCorrect(isRight);
//     setAnswerSubmitted(true);
//     if (isRight) setScore((prev) => prev + 1);
//   };

//   const nextQuestion = () => {
//     setCurrentQuestion((prev) => prev + 1);
//     setInput("");
//     setAnswerSubmitted(false);
//     setIsCorrect(null);
//     setExampleSentence(null);
//   };

//   const getSentence = async () => {
//     setSentenceLoading(true);
//     setExampleSentence(null);
//     const word = quizWords[currentQuestion].target;
//     const sentence = await requestQuizSentence({ listId, word, language: meta?.language ?? undefined });
//     setExampleSentence(sentence ?? "No example sentence available.");
//     setSentenceLoading(false);
//   };

//   const restartQuiz = () => setQuizStarted(false);

//   if (quizStarted && currentQuestion >= quizWords.length) {
//     return (
//       <div className="p-6">
//         <h2 className="text-2xl font-bold mb-4">Quiz Complete!</h2>
//         <p className="mb-4">Your score: {score} / {quizWords.length}</p>
//         <Button onClick={restartQuiz} className="mr-2">Restart</Button>
//         <Button onClick={() => (window.location.href = `/oasis/${listId}`)}>Back</Button>
//       </div>
//     );
//   }

//   if (!quizStarted) {
//     return (
//       <div className="flex flex-col p-6">
//         <h1 className="text-4xl font-bold mb-4">Start Your Quiz — {meta?.name ?? "Oasis"}</h1>

//         <label htmlFor="question-count-select" className="block mb-2 font-bold">Number of Questions:</label>
//         <select
//           id="question-count-select"
//           value={questionCount}
//           onChange={(e) => setQuestionCount(Number(e.target.value))}
//           className="border p-2 mb-4"
//         >
//           {[5, 10, 15, 20].map((num) => (
//             <option key={num} value={num}>{num}</option>
//           ))}
//         </select>

//         <label htmlFor="mode-select" className="block mb-2 font-bold">Mode:</label>
//         <select
//           id="mode-select"
//           value={mode}
//           onChange={(e) => setMode(e.target.value as Mode)}
//           className="border p-2 mb-4"
//         >
//           <option value="en-to-target">English → Target Language</option>
//           <option value="target-to-en">Target Language → English</option>
//         </select>

//         <Button onClick={startQuiz} disabled={pool.length === 0}>
//           {pool.length ? "Start Quiz" : "Add words in Edit Oasis first"}
//         </Button>
//       </div>
//     );
//   }

//   const current = quizWords[currentQuestion];
//   const prompt = mode === "en-to-target" ? current.english : current.target;
//   const correctAnswer = mode === "en-to-target" ? current.target : current.english;

//   return (
//   <div className="min-h-[70vh] bg-neutral-50 p-4 md:p-8">
//     <div className="mx-auto max-w-2xl rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
//       {/* Header / Progress */}
//       <div className="mb-4 flex items-center justify-between">
//         <h2 className="text-lg font-semibold tracking-tight md:text-xl">
//           Question {currentQuestion + 1} / {quizWords.length}
//         </h2>
//         <p className="text-sm text-neutral-500">
//           Score: <span className="font-medium text-neutral-700">{score}</span> / {quizWords.length}
//         </p>
//       </div>

//       {/* Progress Bar (display-only) */}
//       <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
//         <div
//           className="h-full bg-amber-400 transition-all"
//           style={{
//             width:
//               quizWords.length > 0
//                 ? `${Math.min(((currentQuestion + 1) / quizWords.length) * 100, 100)}%`
//                 : "0%",
//           }}
//         />
//       </div>

//       {/* Prompt */}
//       <p className="mb-3 text-sm text-neutral-600">
//         Translate:
//         <span className="ml-2 font-semibold text-neutral-900">{prompt}</span>
//       </p>

//       {/* Answer input */}
//       <input
//         type="text"
//         value={input}
//         onChange={(e) => setInput(e.target.value)}
//         disabled={answerSubmitted}
//         className={[
//           "w-full rounded-xl border bg-white/90 p-3 text-base outline-none shadow-inner placeholder:text-neutral-400",
//           "focus:ring-2 focus:ring-amber-400/60",
//           "mb-3",
//           answerSubmitted && !isCorrect ? "border-red-500 ring-0" : "border-neutral-200",
//         ].join(" ")}
//         placeholder="Type your answer…"
//         aria-invalid={answerSubmitted && !isCorrect ? true : undefined}
//         aria-describedby={answerSubmitted ? "answer-feedback" : undefined}
//       />

//       {/* Actions */}
//       <div className="mb-5 flex flex-wrap gap-2">
//         <Button onClick={checkAnswer} disabled={answerSubmitted} className="px-4 py-2">
//           Submit
//         </Button>
//         <Button disabled={!answerSubmitted} onClick={nextQuestion} className="px-4 py-2">
//           Next
//         </Button>
//         <Button onClick={getSentence} disabled={sentenceLoading} className="px-4 py-2">
//           {sentenceLoading ? "Generating..." : "Sentence"}
//         </Button>
//       </div>

//       {/* Feedback */}
//       {answerSubmitted && (
//         <div id="answer-feedback" className="mb-4">
//           {isCorrect ? (
//             <p className="font-semibold text-green-600">Correct!</p>
//           ) : (
//             <p className="text-red-600">
//               Incorrect. The correct answer is:{" "}
//               <strong className="font-semibold">{correctAnswer}</strong>
//             </p>
//           )}
//         </div>
//       )}

//       {/* Example sentence */}
//       {exampleSentence && (
//         <p className="mb-5 rounded-xl bg-neutral-50 p-4 text-sm italic text-neutral-700">
//           Example: {exampleSentence}
//         </p>
//       )}

//       {/* Footer score (kept for parity) */}
//       <p className="text-sm text-neutral-600">
//         Score: <span className="font-medium text-neutral-800">{score}</span> / {quizWords.length}
//       </p>
//     </div>
//   </div>
// );

// }

// app/oasis/quiz/WrittenQuiz.tsx
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/app/components/Button";
import { useOasisData } from "@/app/lib/hooks/useOasis";
import { requestQuizSentence } from "@/app/lib/actions/geminiQuizAction";

type Mode = "en-to-target" | "target-to-en";

const cardIn: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.98, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

const rowIn: Variants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.3 },
  },
};

// simple shuffle
const pickShuffled = <T,>(arr: T[], n: number) =>
  [...arr].sort(() => Math.random() - 0.5).slice(0, n);

// case/space-insensitive comparison
const norm = (s: string) => s.trim().toLowerCase();

export default function WrittenQuiz() {
  const { listId, meta, words, loading } = useOasisData();

  // Build pool from real oasis data
  const pool = useMemo(
    () =>
      words
        .map(w => ({
          target: (w.target ?? "").trim(),
          english: (w.english ?? "").trim(),
        }))
        .filter(w => w.target && w.english),
    [words]
  );

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [mode, setMode] = useState<Mode>("en-to-target");
  const [count, setCount] = useState(5);
  const [started, setStarted] = useState(false);

  const [idx, setIdx] = useState(0);
  const [quizWords, setQuizWords] = useState<typeof pool>([]);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);

  const [example, setExample] = useState<string | null>(null);
  const [genLoading, setGenLoading] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (started) setTimeout(() => inputRef.current?.focus(), 60);
  }, [started, idx]);

  const current = quizWords[idx];
  const prompt = useMemo(() => {
    if (!current) return "";
    return mode === "en-to-target" ? current.english : current.target;
  }, [current, mode]);

  const correctAnswer = useMemo(() => {
    if (!current) return "";
    return mode === "en-to-target" ? current.target : current.english;
  }, [current, mode]);

  const startQuiz = useCallback(() => {
    const chosen = pickShuffled(pool, count);
    setQuizWords(chosen);
    setIdx(0);
    setScore(0);
    setInput("");
    setSubmitted(false);
    setIsCorrect(null);
    setExample(null);
    setStarted(true);
  }, [pool, count]);

  const onSubmit = useCallback(() => {
    if (!started || submitted || !current) return;
    const right = norm(input) === norm(correctAnswer);
    setIsCorrect(right);
    setSubmitted(true);
    if (right) setScore((s) => s + 1);
    else setShakeKey((k) => k + 1); // shake on wrong
  }, [started, submitted, current, input, correctAnswer]);

  const onNext = useCallback(() => {
    if (!submitted) return;
    const next = idx + 1;
    if (next >= quizWords.length) return;
    setIdx(next);
    setInput("");
    setSubmitted(false);
    setIsCorrect(null);
    setExample(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [submitted, idx, quizWords.length]);

  // submit or next on Enter
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      if (!started) return;
      if (!submitted) onSubmit();
      else onNext();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [started, submitted, onSubmit, onNext]);

  const fetchSentence = useCallback(async () => {
    if (!current || !listId) return;
    try {
      setGenLoading(true);
      setExample(null);
      // ✅ use your server action signature from the first code
      const sentence = await requestQuizSentence({
        listId,
        word: current.target,
        language: meta?.language ?? undefined,
      });
      setExample(sentence ?? "No example sentence available.");
    } catch {
      setExample("Could not generate a sentence right now.");
    } finally {
      setGenLoading(false);
    }
  }, [current, listId, meta?.language]);

  if (!mounted) return <p className="p-6">Loading…</p>;
  if (!listId) return <div className="p-6">Missing list id.</div>;
  if (loading) return <div className="p-6">Loading oasis…</div>;

  // Finished
  if (started && idx >= quizWords.length) {
    const pct = quizWords.length
      ? Math.round((score / quizWords.length) * 100)
      : 0;

    return (
      <div className="w-full flex items-center justify-center p-4">
        <motion.div
          variants={cardIn}
          initial="hidden"
          animate="show"
          className="w-[min(92vw,42rem)] rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl"
        >
          <motion.h2
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl font-semibold text-white text-center"
          >
            Quiz Complete!
          </motion.h2>

          <div className="mt-6 space-y-4 text-center text-white/90">
            <div className="text-lg">
              Score: <span className="font-semibold">{score}</span> / {quizWords.length}
            </div>
            <div className="text-sm text-white/80">Accuracy: {pct}%</div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-white/20 ring-1 ring-white/25">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8 }}
                className="h-full bg-amber-400"
              />
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Button onClick={() => setStarted(false)} className="!cursor-pointer">
                Restart
              </Button>
              <Button
                onClick={() => (window.location.href = `/oasis/${listId}`)}
                className="!bg-white/15 hover:!bg-white/25 !text-white !ring-1 !ring-white/30 !cursor-pointer"
              >
                Back to Oasis
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Setup screen
  if (!started) {
    return (
      <div className="w-full flex items-center justify-center p-4">
        <motion.div
          variants={cardIn}
          initial="hidden"
          animate="show"
          className="w-[min(92vw,48rem)] rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl"
        >
          <motion.h1
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white text-2xl sm:text-3xl font-semibold text-center"
          >
            Start Your Quiz — {meta?.name ?? "Oasis"}
          </motion.h1>

          <motion.div
            variants={rowIn}
            initial="hidden"
            animate="show"
            className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div>
              <label className="block text-sm text-white/85 mb-1">Number of Questions</label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full rounded-lg bg-white/90 px-3 py-2 text-gray-900 shadow ring-1 ring-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
                aria-label="Select number of questions"
              >
                {[5, 10, 15, 20].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-white/85 mb-1">Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as Mode)}
                className="w-full rounded-lg bg-white/90 px-3 py-2 text-gray-900 shadow ring-1 ring-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
                aria-label="Select quiz direction"
              >
                <option value="en-to-target">English → {meta?.language ?? "Target language"}</option>
                <option value="target-to-en">{meta?.language ?? "Target language"} → English</option>
              </select>
            </div>
          </motion.div>

          <div className="mt-6 flex justify-center">
            <Button
              onClick={startQuiz}
              className="!cursor-pointer"
              disabled={pool.length === 0}
              title={pool.length === 0 ? "Add words in Edit Oasis first" : "Start Quiz"}
            >
              {pool.length ? "Start Quiz" : "Add words in Edit Oasis first"}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // In-progress
  const progressPct = quizWords.length
    ? Math.round(((idx + (submitted ? 1 : 0)) / quizWords.length) * 100)
    : 0;

  return (
    <div className="w-full flex items-center justify-center p-4">
      <motion.div
        variants={cardIn}
        initial="hidden"
        animate="show"
        className="w-[min(92vw,48rem)] rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="text-white/90">
            <div className="text-sm">
              Question {idx + 1} / {quizWords.length}
            </div>
            <div className="mt-1 h-2 w-48 overflow-hidden rounded-full bg-white/20 ring-1 ring-white/25">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.4 }}
                className="h-full bg-amber-400"
              />
            </div>
          </div>

          <div className="text-white/90 text-sm">
            Score: <span className="font-semibold">{score}</span>
          </div>
        </div>

        {/* Prompt */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-6 rounded-xl bg-white/90 p-4 text-center text-gray-900 ring-1 ring-white/30 shadow"
        >
          <div className="text-sm text-gray-700">Translate</div>
          <div className="mt-1 text-2xl font-semibold tracking-wide">{prompt}</div>
        </motion.div>

        {/* Input with shake on wrong */}
        <motion.div
          key={shakeKey}
          initial={false}
          animate={
            submitted && isCorrect === false
              ? { x: [0, -8, 8, -6, 6, -3, 3, 0] }
              : {}
          }
          transition={{ duration: 0.35 }}
          className="mt-5"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={submitted}
            className={[
              "w-full rounded-xl bg-white/90 px-4 py-3 text-gray-900 ring-1 ring-white/30 shadow focus:outline-none focus:ring-2 focus:ring-indigo-300",
              submitted && isCorrect === false ? "outline outline-2 outline-rose-400" : "",
            ].join(" ")}
            placeholder="Type your answer…"
            aria-label="Your answer"
          />
        </motion.div>

        {/* Actions */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button onClick={onSubmit} disabled={submitted} className="!cursor-pointer disabled:!cursor-not-allowed">
              Submit
            </Button>
            <Button
              onClick={onNext}
              disabled={!submitted}
              className="!bg-white/15 hover:!bg-white/25 !text-white !ring-1 !ring-white/30 !cursor-pointer disabled:!cursor-not-allowed"
            >
              Next
            </Button>
          </div>

          <Button
            onClick={fetchSentence}
            disabled={genLoading}
            className="!bg-indigo-500 hover:!bg-indigo-400 !cursor-pointer disabled:!cursor-not-allowed"
          >
            {genLoading ? "Generating…" : "Example sentence"}
          </Button>
        </div>

        {/* Feedback */}
        <div className="mt-3 min-h-[1.5rem]">
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={
                isCorrect
                  ? "text-emerald-300 font-semibold"
                  : "text-rose-300 font-medium"
              }
            >
              {isCorrect ? "Correct! 🎉" : (
                <>
                  Incorrect. Correct answer:{" "}
                  <span className="font-semibold">{correctAnswer}</span>
                </>
              )}
            </motion.div>
          )}
        </div>

        {/* Example sentence */}
        {example && (
          <motion.p
            variants={rowIn}
            initial="hidden"
            animate="show"
            className="mt-4 rounded-xl bg-white/10 p-3 text-white/90 ring-1 ring-white/20"
          >
            <span className="text-white/70 mr-2">Example:</span>
            {example}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

// "use client";

// import { Button } from "@/app/components/Button";
// import { requestQuizSentence } from "@/app/lib/actions/geminiQuizAction";
// import {
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";
// import { motion, type Variants } from "framer-motion";

// // examples
// const WORDS = [
//   { target: "りんご", english: "apple" },
//   { target: "ねこ", english: "cat" },
//   { target: "みず", english: "water" },
//   { target: "いぬ", english: "dog" },
//   { target: "やま", english: "mountain" },
// ];

// type Mode = "en-to-target" | "target-to-en";

// const cardIn: Variants = {
//   hidden: { opacity: 0, y: 12, scale: 0.98, filter: "blur(6px)" },
//   show: {
//     opacity: 1,
//     y: 0,
//     scale: 1,
//     filter: "blur(0px)",
//     transition: { duration: 0.45, ease: "easeOut" },
//   },
// };

// const rowIn: Variants = {
//   hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
//   show: {
//     opacity: 1,
//     y: 0,
//     filter: "blur(0px)",
//     transition: { duration: 0.3 },
//   },
// };

// export default function WrittenQuiz() {
//   const [mounted, setMounted] = useState(false);
//   useEffect(() => setMounted(true), []);

//   const [mode, setMode] = useState<Mode>("en-to-target");
//   const [count, setCount] = useState(5);
//   const [started, setStarted] = useState(false);

//   const [idx, setIdx] = useState(0);
//   const [quizWords, setQuizWords] = useState<typeof WORDS>([]);
//   const [input, setInput] = useState("");
//   const [submitted, setSubmitted] = useState(false);
//   const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
//   const [score, setScore] = useState(0);

//   const [example, setExample] = useState<string | null>(null);
//   const [genLoading, setGenLoading] = useState(false);
//   const [shakeKey, setShakeKey] = useState(0);
//   const inputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     if (started) setTimeout(() => inputRef.current?.focus(), 60);
//   }, [started, idx]);

//   const current = quizWords[idx];
//   const prompt = useMemo(() => {
//     if (!current) return "";
//     return mode === "en-to-target" ? current.english : current.target;
//   }, [current, mode]);

//   const correctAnswer = useMemo(() => {
//     if (!current) return "";
//     return mode === "en-to-target" ? current.target : current.english;
//   }, [current, mode]);

//   const startQuiz = useCallback(() => {
//     const shuffled = [...WORDS].sort(() => Math.random() - 0.5);
//     setQuizWords(shuffled.slice(0, count));
//     setIdx(0);
//     setScore(0);
//     setInput("");
//     setSubmitted(false);
//     setIsCorrect(null);
//     setExample(null);
//     setStarted(true);
//   }, [count]);

//   const onSubmit = useCallback(() => {
//     if (!started || submitted || !current) return;
//     const right = input.trim() === correctAnswer;
//     setIsCorrect(right);
//     setSubmitted(true);
//     if (right) setScore((s) => s + 1);
//     else setShakeKey((k) => k + 1); // shake on wrong
//   }, [started, submitted, current, input, correctAnswer]);

//   const onNext = useCallback(() => {
//     if (!submitted) return;
//     const next = idx + 1;
//     if (next >= quizWords.length) return;
//     setIdx(next);
//     setInput("");
//     setSubmitted(false);
//     setIsCorrect(null);
//     setExample(null);
//     setTimeout(() => inputRef.current?.focus(), 50);
//   }, [submitted, idx, quizWords.length]);

//   // submit or next on Enter
//   useEffect(() => {
//     const h = (e: KeyboardEvent) => {
//       if (e.key !== "Enter") return;
//       e.preventDefault();
//       if (!started) return;
//       if (!submitted) onSubmit();
//       else onNext();
//     };
//     window.addEventListener("keydown", h);
//     return () => window.removeEventListener("keydown", h);
//   }, [started, submitted, onSubmit, onNext]);

//   const fetchSentence = useCallback(async () => {
//     if (!current) return;
//     try {
//       setGenLoading(true);
//       setExample(null);
//       const sentence = await requestQuizSentence(current.target);
//       setExample(sentence ?? "No example sentence available.");
//     } catch {
//       setExample("Could not generate a sentence right now.");
//     } finally {
//       setGenLoading(false);
//     }
//   }, [current]);

//   // finished
//   if (mounted && started && idx >= quizWords.length) {
//     const pct = quizWords.length
//       ? Math.round((score / quizWords.length) * 100)
//       : 0;

//     return (
//       <div className="w-full flex items-center justify-center p-4">
//         <motion.div
//           variants={cardIn}
//           initial="hidden"
//           animate="show"
//           className="w-[min(92vw,42rem)] rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl"
//         >
//           <motion.h2
//             initial={{ opacity: 0, y: 6 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className="text-2xl sm:text-3xl font-semibold text-white text-center"
//           >
//             Quiz Complete!
//           </motion.h2>

//           <div className="mt-6 space-y-4 text-center text-white/90">
//             <div className="text-lg">
//               Score: <span className="font-semibold">{score}</span> / {quizWords.length}
//             </div>
//             <div className="text-sm text-white/80">Accuracy: {pct}%</div>

//             <div className="h-2 w-full overflow-hidden rounded-full bg-white/20 ring-1 ring-white/25">
//               <motion.div
//                 initial={{ width: 0 }}
//                 animate={{ width: `${pct}%` }}
//                 transition={{ duration: 0.8 }}
//                 className="h-full bg-amber-400"
//               />
//             </div>

//             <div className="mt-4 flex flex-wrap justify-center gap-3">
//               <Button onClick={() => setStarted(false)} className="!cursor-pointer">
//                 Restart
//               </Button>
//               <Button
//                 onClick={() => (window.location.href = "/oasis")}
//                 className="!bg-white/15 hover:!bg-white/25 !text-white !ring-1 !ring-white/30 !cursor-pointer"
//               >
//                 Back to Oasis
//               </Button>
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     );
//   }

//   // setup screen
//   if (!mounted || !started) {
//     return (
//       <div className="w-full flex items-center justify-center p-4">
//         <motion.div
//           variants={cardIn}
//           initial="hidden"
//           animate="show"
//           className="w-[min(92vw,48rem)] rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl"
//         >
//           <motion.h1
//             initial={{ opacity: 0, y: 6 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className="text-white text-2xl sm:text-3xl font-semibold text-center"
//           >
//             Start Your Quiz
//           </motion.h1>

//           <motion.div
//             variants={rowIn}
//             initial="hidden"
//             animate="show"
//             className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
//           >
//             <div>
//               <label className="block text-sm text-white/85 mb-1">Number of Questions</label>
//               <select
//                 value={count}
//                 onChange={(e) => setCount(Number(e.target.value))}
//                 className="w-full rounded-lg bg-white/90 px-3 py-2 text-gray-900 shadow ring-1 ring-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
//                 aria-label="Select number of questions"
//               >
//                 {[5, 10, 15, 20].map((n) => (
//                   <option key={n} value={n}>
//                     {n}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm text-white/85 mb-1">Mode</label>
//               <select
//                 value={mode}
//                 onChange={(e) => setMode(e.target.value as Mode)}
//                 className="w-full rounded-lg bg-white/90 px-3 py-2 text-gray-900 shadow ring-1 ring-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
//                 aria-label="Select quiz direction"
//               >
//                 <option value="en-to-target">English → Target language</option>
//                 <option value="target-to-en">Target language → English</option>
//               </select>
//             </div>
//           </motion.div>

//           <div className="mt-6 flex justify-center">
//             <Button onClick={startQuiz} className="!cursor-pointer">
//               Start Quiz
//             </Button>
//           </div>
//         </motion.div>
//       </div>
//     );
//   }

//   // in-progress
//   const progressPct = quizWords.length
//     ? Math.round(((idx + (submitted ? 1 : 0)) / quizWords.length) * 100)
//     : 0;

//   return (
//     <div className="w-full flex items-center justify-center p-4">
//       <motion.div
//         variants={cardIn}
//         initial="hidden"
//         animate="show"
//         className="w-[min(92vw,48rem)] rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl"
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between gap-3">
//           <div className="text-white/90">
//             <div className="text-sm">
//               Question {idx + 1} / {quizWords.length}
//             </div>
//             <div className="mt-1 h-2 w-48 overflow-hidden rounded-full bg-white/20 ring-1 ring-white/25">
//               <motion.div
//                 initial={{ width: 0 }}
//                 animate={{ width: `${progressPct}%` }}
//                 transition={{ duration: 0.4 }}
//                 className="h-full bg-amber-400"
//               />
//             </div>
//           </div>

//           <div className="text-white/90 text-sm">
//             Score: <span className="font-semibold">{score}</span>
//           </div>
//         </div>

//         {/* Prompt */}
//         <motion.div
//           initial={{ opacity: 0, y: 6 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.15 }}
//           className="mt-6 rounded-xl bg-white/90 p-4 text-center text-gray-900 ring-1 ring-white/30 shadow"
//         >
//           <div className="text-sm text-gray-700">Translate</div>
//           <div className="mt-1 text-2xl font-semibold tracking-wide">{prompt}</div>
//         </motion.div>

//         {/* Input with shake on wrong */}
//         <motion.div
//           key={shakeKey}
//           initial={false}
//           animate={
//             submitted && isCorrect === false
//               ? { x: [0, -8, 8, -6, 6, -3, 3, 0] }
//               : {}
//           }
//           transition={{ duration: 0.35 }}
//           className="mt-5"
//         >
//           <input
//             ref={inputRef}
//             type="text"
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             disabled={submitted}
//             className={[
//               "w-full rounded-xl bg-white/90 px-4 py-3 text-gray-900 ring-1 ring-white/30 shadow focus:outline-none focus:ring-2 focus:ring-indigo-300",
//               submitted && isCorrect === false ? "outline outline-2 outline-rose-400" : "",
//             ].join(" ")}
//             placeholder="Type your answer…"
//             aria-label="Your answer"
//           />
//         </motion.div>

//         {/* Actions */}
//         <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
//           <div className="flex items-center gap-2">
//             <Button onClick={onSubmit} disabled={submitted} className="!cursor-pointer disabled:!cursor-not-allowed">
//               Submit
//             </Button>
//             <Button
//               onClick={onNext}
//               disabled={!submitted}
//               className="!bg-white/15 hover:!bg-white/25 !text-white !ring-1 !ring-white/30 !cursor-pointer disabled:!cursor-not-allowed"
//             >
//               Next
//             </Button>
//           </div>

//           <Button
//             onClick={fetchSentence}
//             disabled={genLoading}
//             className="!bg-indigo-500 hover:!bg-indigo-400 !cursor-pointer disabled:!cursor-not-allowed"
//           >
//             {genLoading ? "Generating…" : "Example sentence"}
//           </Button>
//         </div>

//         {/* Feedback */}
//         <div className="mt-3 min-h-[1.5rem]">
//           {submitted && (
//             <motion.div
//               initial={{ opacity: 0, y: 4 }}
//               animate={{ opacity: 1, y: 0 }}
//               className={
//                 isCorrect
//                   ? "text-emerald-300 font-semibold"
//                   : "text-rose-300 font-medium"
//               }
//             >
//               {isCorrect ? "Correct! 🎉" : (
//                 <>
//                   Incorrect. Correct answer:{" "}
//                   <span className="font-semibold">{correctAnswer}</span>
//                 </>
//               )}
//             </motion.div>
//           )}
//         </div>

//         {/* Example sentence */}
//         {example && (
//           <motion.p
//             variants={rowIn}
//             initial="hidden"
//             animate="show"
//             className="mt-4 rounded-xl bg-white/10 p-3 text-white/90 ring-1 ring-white/20"
//           >
//             <span className="text-white/70 mr-2">Example:</span>
//             {example}
//           </motion.p>
//         )}
//       </motion.div>
//     </div>
//   );
// }
