// app/oasis/quiz/WordMatcher.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Button } from "@/app/components/Button";
import { useOasisData } from "@/app/lib/hooks/useOasis";

type MatchItem = {
  id: string;       // stable id from DB
  known: string;    // English (known language)
  target: string;   // Target language word
};

// simple shuffle
function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const listContainer: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { staggerChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 10, filter: "blur(3px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 160, damping: 14 },
  },
};

export default function WordMatcher() {
  const { listId, meta, words, loading } = useOasisData();
  const prefersReducedMotion = useReducedMotion();

  // Build pairs from real data (filter blanks)
  const items: MatchItem[] = useMemo(
    () =>
      words
        .map((w) => ({
          id: w.id,
          known: (w.english ?? "").trim(),
          target: (w.target ?? "").trim(),
        }))
        .filter((x) => x.known && x.target),
    [words]
  );

  // Shuffled RIGHT column
  const [shuffledTargets, setShuffledTargets] = useState<MatchItem[]>([]);
  // selected item from LEFT (by id)
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // matched pairs (store by id)
  const [matched, setMatched] = useState<Set<string>>(new Set());
  // for shake animation on wrong attempts (keyed by target id)
  const [wrongKey, setWrongKey] = useState<string | null>(null);
  // for re-keying sections on reset to replay animations
  const [round, setRound] = useState(1);

  // Initialize on data change
  useEffect(() => {
    setMatched(new Set());
    setSelectedId(null);
    setShuffledTargets(shuffle(items));
    setWrongKey(null);
    setRound((r) => r + 1);
  }, [items]);

  const isMatched = (id: string) => matched.has(id);
  const total = items.length;
  const matchedCount = matched.size;
  const win = total > 0 && matchedCount === total;
  const progressPct = total ? Math.round((matchedCount / total) * 100) : 0;

  const reset = () => {
    setMatched(new Set());
    setSelectedId(null);
    setShuffledTargets(shuffle(items));
    setWrongKey(null);
    setRound((r) => r + 1);
  };

  // LEFT click (known language)
  const handleKnownClick = (id: string) => {
    if (isMatched(id)) return;
    setSelectedId(id);
  };

  // RIGHT click (target language)
  const handleTargetClick = (id: string) => {
    if (!selectedId || isMatched(id)) return;

    if (id === selectedId) {
      // correct
      const next = new Set(matched);
      next.add(id);
      setMatched(next);
      setSelectedId(null);
      // award XP + show toast (fire-and-forget)
      void (async () => {
        try {
          const { addXp, dispatchXpToast } = await import("@/app/lib/actions/xpAction");
          const XP_AMOUNTS = (await import("@/app/config/xp")).default;
          try {
            dispatchXpToast(XP_AMOUNTS.quizCorrect);
          } catch {}
          void addXp(XP_AMOUNTS.quizCorrect);
        } catch (err) {
          // non-fatal
          // eslint-disable-next-line no-console
          console.warn("Could not award quiz XP", err);
        }
      })();
    } else {
      // wrong — shake RIGHT tile
      setWrongKey(`${id}-${Date.now()}`);
      setSelectedId(null);
      setTimeout(() => setWrongKey(null), 350);
    }
  };

  if (!listId) return <div className="p-6 text-gray-900">Missing list id.</div>;

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-white/95 p-6 shadow-md ring-1 ring-black/5">
          <div className="inline-flex items-center justify-center rounded-full bg-emerald-50 px-4 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
            Preparing Word Matcher…
          </div>

          <div className="h-2 w-48 overflow-hidden rounded-full bg-gray-200 ring-1 ring-black/5">
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
              Fetching your oasis words. Your matching game will start in a moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-6 text-gray-900">
        <p className="mb-2">No words in this oasis yet.</p>
        <p className="text-sm text-gray-600">
          Add words in <strong>Edit Oasis</strong> to play Word Matcher.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top bar: progress + reset */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-[12rem] grow">
          <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden ring-1 ring-black/5">
            <motion.div
              key={matchedCount}
              className="h-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-xs font-medium text-gray-700">
            {matchedCount}/{total}
          </span>
        </div>

        <Button
          onClick={reset}
          className="!rounded-lg !px-3 !py-1.5 !cursor-pointer"
        >
          Reset
        </Button>
      </div>

      {/* Win state */}
      {win ? (
        <motion.div
          key={`win-${round}`}
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="rounded-xl bg-emerald-50 ring-1 ring-emerald-200 p-4 text-emerald-800"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">You win! 🎉</h3>
              <p className="text-sm">
                Oasis: <strong>{meta?.name ?? "Oasis"}</strong> — Great matching!
              </p>
            </div>
            <Button
              onClick={reset}
              className="!rounded-lg !px-4 !py-2 !cursor-pointer"
            >
              Play again
            </Button>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Board */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Left: Known language (English) */}
            <motion.div
              key={`known-${round}`}
              variants={listContainer}
              initial="hidden"
              animate="show"
              className="rounded-xl bg-white/95 ring-1 ring-black/5 p-3 shadow-sm"
            >
              <div className="mb-2 text-sm font-semibold text-gray-700">
                English
              </div>
              <div className="grid grid-cols-1 gap-2">
                {items.map((m) => {
                  const matched = isMatched(m.id);
                  const selected = selectedId === m.id;
                  return (
                    <motion.div
                      key={`known-${m.id}`}
                      variants={item}
                      whileHover={{ y: matched ? 0 : -2 }}
                      whileTap={{ scale: matched ? 1 : 0.98 }}
                    >
                      <Button
                        onClick={() => handleKnownClick(m.id)}
                        disabled={matched}
                        aria-pressed={selected}
                        aria-label={`Select ${m.known}`}
                        className={[
                          "!w-full !justify-center !rounded-lg !px-4 !py-2 transition focus:!ring-2 focus:!ring-indigo-300",
                          matched
                            ? "bg-emerald-500 hover:bg-emerald-500 cursor-not-allowed !text-white"
                            : selected
                            ? "bg-indigo-500 hover:bg-indigo-500 !text-white !cursor-pointer"
                            : "!bg-white hover:!bg-gray-50 !text-gray-900 border border-black/10 !cursor-pointer",
                        ].join(" ")}
                      >
                        {m.known}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Right: Target language (shuffled) */}
            <motion.div
              key={`target-${round}`}
              variants={listContainer}
              initial="hidden"
              animate="show"
              className="rounded-xl bg-white/95 ring-1 ring-black/5 p-3 shadow-sm"
            >
              <div className="mb-2 text-sm font-semibold text-gray-700">
                {meta?.language ?? "Target"}
              </div>
              <div className="grid grid-cols-1 gap-2">
                {shuffledTargets.map((m) => {
                  const matched = isMatched(m.id);
                  const isWrong = wrongKey?.startsWith(`${m.id}-`) ?? false;
                  return (
                    <motion.div
                      key={`target-${m.id}`}
                      variants={item}
                      animate={
                        isWrong
                          ? { x: [0, -6, 6, -4, 4, 0] }
                          : "show"
                      }
                      transition={isWrong ? { duration: 0.35 } : undefined}
                      whileHover={{ y: matched ? 0 : -2 }}
                      whileTap={{ scale: matched ? 1 : 0.98 }}
                    >
                      <Button
                        onClick={() => handleTargetClick(m.id)}
                        disabled={matched}
                        aria-label={`Choose ${m.target}`}
                        className={[
                          "!w-full !justify-center !rounded-lg !px-4 !py-2 transition focus:!ring-2 focus:!ring-indigo-300",
                          matched
                            ? "bg-emerald-500 hover:bg-emerald-500 cursor-not-allowed !text-white"
                            : "!bg-white hover:!bg-gray-50 !text-gray-900 border border-black/10 !cursor-pointer",
                        ].join(" ")}
                      >
                        {m.target}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Helper hint */}
          <div className="mt-1 text-center text-xs text-gray-600">
            Select a word on the left, then its translation on the right.
          </div>
        </>
      )}
    </div>
  );
}
