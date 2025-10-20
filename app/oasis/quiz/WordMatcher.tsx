// app/oasis/quiz/WordMatcher.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/app/components/Button";

interface GoodMatch {
  knownLanguage: string;
  targetLanguage: string;
}

// Demo pairs (replace with API later)
const preMatchedData: GoodMatch[] = [
  { knownLanguage: "Dog",   targetLanguage: "Perro" },
  { knownLanguage: "Cat",   targetLanguage: "Gato" },
  { knownLanguage: "Fish",  targetLanguage: "Pez" },
  { knownLanguage: "Tiger", targetLanguage: "Tigre" },
  { knownLanguage: "Monkey",targetLanguage: "Mono" },
];

const shuffleArray = (arr: GoodMatch[]) => arr.slice().sort(() => Math.random() - 0.5);

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
  const [shuffledData, setShuffledData] = useState<GoodMatch[]>(() =>
    shuffleArray(preMatchedData)
  );
  const [selectedWord, setSelectedWord] = useState<GoodMatch | null>(null);
  const [pairedData, setPairedData] = useState<GoodMatch[]>([]);
  const [wrongKey, setWrongKey] = useState<string | null>(null);
  const [round, setRound] = useState(1);

  const total = preMatchedData.length;
  const matchedCount = pairedData.length;
  const win = matchedCount === total;

  const progressPct = useMemo(
    () => Math.round((matchedCount / total) * 100),
    [matchedCount, total]
  );

  const isMatched = (m: GoodMatch) => pairedData.some((p) => p === m);

  const isSelected = (m: GoodMatch) =>
    selectedWord?.knownLanguage === m.knownLanguage &&
    selectedWord?.targetLanguage === m.targetLanguage;

  useEffect(() => {
    // initial shuffle
    setShuffledData(shuffleArray(preMatchedData));
  }, []);

  const handleTargetClick = (match: GoodMatch) => {
    if (
      selectedWord &&
      match.knownLanguage === selectedWord.knownLanguage &&
      match.targetLanguage === selectedWord.targetLanguage
    ) {
      // correct
      setPairedData((prev) => [...prev, match]);
      setSelectedWord(null);
    } else {
      // wrong -> shake that tile
      setWrongKey(`${match.knownLanguage}-${match.targetLanguage}-${Date.now()}`);
      setSelectedWord(null);
      setTimeout(() => setWrongKey(null), 350);
    }
  };

  const reset = () => {
    setSelectedWord(null);
    setPairedData([]);
    setShuffledData(shuffleArray(preMatchedData));
    setWrongKey(null);
    setRound((r) => r + 1);
  };

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

        <Button onClick={reset} className="!rounded-lg !px-3 !py-1.5">
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
                Great matching—shuffle and play again or try another mode.
              </p>
            </div>
            <Button onClick={reset} className="!rounded-lg !px-4 !py-2">
              Play again
            </Button>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Board */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Left: Known language */}
            <motion.div
              key={`known-${round}`}
              variants={listContainer}
              initial="hidden"
              animate="show"
              className="rounded-xl bg-white/95 ring-1 ring-black/5 p-3 shadow-sm"
            >
              <div className="mb-2 text-sm font-semibold text-gray-700">English</div>
              <div className="grid grid-cols-1 gap-2">
                {preMatchedData.map((m) => {
                  const matched = isMatched(m);
                  const selected = isSelected(m);
                  return (
                    <motion.div
                      key={`known-${m.knownLanguage}`}
                      variants={item}
                      whileHover={{ y: matched ? 0 : -2 }}
                      whileTap={{ scale: matched ? 1 : 0.98 }}
                    >
                      <Button
                        onClick={() => setSelectedWord(m)}
                        disabled={matched}
                        aria-pressed={selected}
                        aria-label={`Select ${m.knownLanguage}`}
                        className={[
                          "!w-full !justify-center !rounded-lg !px-4 !py-2 transition",
                          matched
                            ? "bg-emerald-500 hover:bg-emerald-500 cursor-not-allowed !text-white"
                            : selected
                            ? "bg-indigo-500 hover:bg-indigo-500 !text-white"
                            : "!bg-white hover:!bg-gray-50 !text-gray-900 border border-black/10",
                        ].join(" ")}
                      >
                        {m.knownLanguage}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Right: Target language */}
            <motion.div
              key={`target-${round}`}
              variants={listContainer}
              initial="hidden"
              animate="show"
              className="rounded-xl bg-white/95 ring-1 ring-black/5 p-3 shadow-sm"
            >
              <div className="mb-2 text-sm font-semibold text-gray-700">Spanish</div>
              <div className="grid grid-cols-1 gap-2">
                {shuffledData.map((m) => {
                  const matched = isMatched(m);
                  const wrong =
                    wrongKey?.startsWith(`${m.knownLanguage}-${m.targetLanguage}`) ?? false;
                  return (
                    <motion.div
                      key={`target-${m.targetLanguage}`}
                      variants={item}
                      animate={wrong ? { x: [0, -6, 6, -4, 4, 0] } : "show"}
                      transition={wrong ? { duration: 0.35 } : undefined}
                      whileHover={{ y: matched ? 0 : -2 }}
                      whileTap={{ scale: matched ? 1 : 0.98 }}
                    >
                      <Button
                        onClick={() => handleTargetClick(m)}
                        disabled={matched}
                        aria-label={`Choose ${m.targetLanguage}`}
                        className={[
                          "!w-full !justify-center !rounded-lg !px-4 !py-2 transition",
                          matched
                            ? "bg-emerald-500 hover:bg-emerald-500 cursor-not-allowed !text-white"
                            : "!bg-white hover:!bg-gray-50 !text-gray-900 border border-black/10",
                        ].join(" ")}
                      >
                        {m.targetLanguage}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Helper hint */}
          <div className="text-center text-xs text-gray-600 mt-1">
            Select a word on the left, then its translation on the right.
          </div>
        </>
      )}
    </div>
  );
}
