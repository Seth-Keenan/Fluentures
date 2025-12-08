// app/oasis/quiz/WrittenQuiz.tsx
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, type Variants, useReducedMotion } from "framer-motion";
import { Button } from "@/app/components/Button";
import { useOasisData } from "@/app/lib/hooks/useOasis";
import { requestQuizSentence } from "@/app/lib/actions/geminiQuizAction";
import { addXp, dispatchXpToast } from "@/app/lib/actions/xpAction";
import XP_AMOUNTS from "@/app/config/xp";

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
  const prefersReducedMotion = useReducedMotion();

  // Build pool from real oasis data
  const pool = useMemo(
    () =>
      words
        .map((w) => ({
          target: (w.target ?? "").trim(),
          english: (w.english ?? "").trim(),
        }))
        .filter((w) => w.target && w.english),
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

  const availableWords = pool.length;

  useEffect(() => {
    if (availableWords > 0 && count > availableWords) {
      setCount(availableWords);
    }
  }, [availableWords, count]);

  useEffect(() => {
    if (started) {
      setTimeout(() => inputRef.current?.focus(), 60);
    }
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
    const maxQuestions = Math.min(count, pool.length);
    if (maxQuestions <= 0) return;

    const chosen = pickShuffled(pool, maxQuestions);
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
    if (right) {
      // show toast immediately (so UI feedback isn't blocked by cookies/fetch)
      try {
        dispatchXpToast(XP_AMOUNTS.quizCorrect);
      } catch {}
      // award XP in background
      void addXp(XP_AMOUNTS.quizCorrect);
    }
  }, [started, submitted, current, input, correctAnswer]);

  const onNext = useCallback(() => {
    if (!submitted) return;
    const next = idx + 1;

    if (next >= quizWords.length) {
      setIdx(quizWords.length);
      return;
    }

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
      const sentence = await requestQuizSentence({
        listId,
        word: current.target,
        language: meta?.language ?? undefined,
      });
      const text = sentence ?? "No example sentence available.";
      setExample(text);
      // award XP for generating a sentence (show toast immediately)
      if (sentence) {
        try {
          dispatchXpToast(XP_AMOUNTS.sentenceCorrect);
        } catch {}
        void addXp(XP_AMOUNTS.sentenceCorrect);
      }
    } catch {
      setExample("Could not generate a sentence right now.");
    } finally {
      setGenLoading(false);
    }
  }, [current, listId, meta?.language]);

  const LoadingCard = ({ label }: { label: string }) => (
    <div className="w-full flex items-center justify-center p-4">
      <div className="w-[min(92vw,32rem)] rounded-2xl bg-white/95 ring-1 ring-black/5 shadow-md px-6 py-5 flex flex-col items-center gap-4">
        <div className="inline-flex items-center justify-center rounded-full bg-emerald-50 px-4 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
          {label}
        </div>

        <div className="h-2 w-40 overflow-hidden rounded-full bg-gray-200 ring-1 ring-black/5">
          <motion.div
            className="h-full w-1/3 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400"
            initial={{ x: "-120%" }}
            animate={
              prefersReducedMotion
                ? { x: "0%", width: "100%" }
                : { x: ["-120%", "260%"] }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0.8, ease: "easeOut" }
                : { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
            }
          />
        </div>

        <div className="flex flex-col items-center gap-2 text-xs text-gray-700">
          <span className="h-6 w-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-center max-w-xs">
            Getting your oasis ready. Your written quiz will begin in a moment.
          </p>
        </div>
      </div>
    </div>
  );

  if (!mounted) return <LoadingCard label="Preparing quiz…" />;
  if (!listId) return <div className="p-6 text-gray-900">Missing list id.</div>;
  if (loading) return <LoadingCard label="Loading oasis words…" />;

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
            className="text-2xl sm:text-3xl font-semibold text-black text-center"
          >
            Quiz Complete!
          </motion.h2>

          <div className="mt-6 space-y-4 text-center text-black/90">
            <div className="text-lg">
              Score: <span className="font-semibold">{score}</span> /{" "}
              {quizWords.length}
            </div>
            <div className="text-sm text-black/80">Accuracy: {pct}%</div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 ring-1 ring-black/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8 }}
                className="h-full bg-amber-400"
              />
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Button
                onClick={startQuiz}
                className="!rounded-lg !px-4 !py-2 !cursor-pointer"
              >
                Play again
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
            className="text-black text-2xl sm:text-3xl font-semibold text-center"
          >
            Start Your Quiz — {meta?.name ?? "Oasis"}
          </motion.h1>

          <p className="mt-2 text-center text-xs text-black/70">
            You currently have{" "}
            <span className="font-semibold">{availableWords}</span>{" "}
            word{availableWords === 1 ? "" : "s"} in this oasis. The quiz will
            use up to that many questions.
          </p>

          <motion.div
            variants={rowIn}
            initial="hidden"
            animate="show"
            className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div>
              <label className="block text-sm text-black/85 mb-1">
                Number of Questions
              </label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full rounded-lg bg-white/90 px-3 py-2 text-gray-900 shadow ring-1 ring-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
                aria-label="Select number of questions"
              >
                {[5, 10, 15, 20].map((n) => (
                  <option
                    key={n}
                    value={n}
                    disabled={availableWords > 0 && n > availableWords}
                  >
                    {n}
                  </option>
                ))}
                {availableWords > 0 &&
                  ![5, 10, 15, 20].includes(availableWords) && (
                    <option value={availableWords}>
                      {availableWords} (max available)
                    </option>
                  )}
              </select>
            </div>

            <div>
              <label className="block text-sm text-black/85 mb-1">Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as Mode)}
                className="w-full rounded-lg bg-white/90 px-3 py-2 text-gray-900 shadow ring-1 ring-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
                aria-label="Select quiz direction"
              >
                <option value="en-to-target">
                  English → {meta?.language ?? "Target language"}
                </option>
                <option value="target-to-en">
                  {meta?.language ?? "Target language"} → English
                </option>
              </select>
            </div>
          </motion.div>

          <div className="mt-6 flex justify-center">
            <Button
              onClick={startQuiz}
              className="!cursor-pointer"
              disabled={pool.length === 0}
              title={
                pool.length === 0
                  ? "Add words in Edit Oasis first"
                  : "Start Quiz"
              }
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
    ? Math.round(
        ((idx + (submitted ? 1 : 0)) / quizWords.length) * 100
      )
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
          <div className="text-black/90">
            <div className="text-sm">
              Question {idx + 1} / {quizWords.length}
            </div>
            {/* progress bar with outline */}
            <div className="mt-1 h-2 w-48 overflow-hidden rounded-full bg-gray-200 ring-1 ring-black/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.4 }}
                className="h-full bg-amber-400"
              />
            </div>
          </div>

          <div className="text-black/90 text-sm">
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
          <div className="mt-1 text-2xl font-semibold tracking-wide">
            {prompt}
          </div>
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
              submitted && isCorrect === false
                ? "outline outline-2 outline-rose-400"
                : "",
            ].join(" ")}
            placeholder="Type your answer…"
            aria-label="Your answer"
          />
        </motion.div>

        {/* Actions */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              onClick={onSubmit}
              disabled={submitted}
              className="!cursor-pointer disabled:!cursor-not-allowed"
            >
              Submit
            </Button>
            <Button
              onClick={onNext}
              disabled={!submitted}
              className="!cursor-pointer disabled:!cursor-not-allowed"
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
              {isCorrect ? (
                "Correct! 🎉"
              ) : (
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
            className="mt-4 rounded-xl bg-white/10 p-3 text-black/90 ring-1 ring-white/20"
          >
            <span className="text-black/70 mr-2">Example:</span>
            {example}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
