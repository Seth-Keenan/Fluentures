// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import { Button } from "@/app/components/Button";
// import { useOasisData } from "@/app/lib/hooks/useOasis";

// type MatchItem = {
//   id: string;
//   known: string;   // English (known language)
//   target: string;  // Target language word
// };

// // Fisher–Yates-ish shuffle for a new target order each round
// function shuffle<T>(arr: T[]): T[] {
//   return [...arr].sort(() => Math.random() - 0.5);
// }

// export default function WordMatcher() {
//   const { listId, meta, words, loading } = useOasisData();

//   // Build match items from the oasis words (filter blanks)
//   const items: MatchItem[] = useMemo(
//     () =>
//       words
//         .map((w) => ({
//           id: w.id,
//           known: (w.english ?? "").trim(),
//           target: (w.target ?? "").trim(),
//         }))
//         .filter((x) => x.known && x.target),
//     [words]
//   );

//   const [shuffledTargets, setShuffledTargets] = useState<MatchItem[]>([]);
//   const [selectedId, setSelectedId] = useState<string | null>(null); // pick from LEFT (known)
//   const [matched, setMatched] = useState<Set<string>>(new Set());    // store matched by id

//   // Initialize / reinitialize when oasis changes
//   useEffect(() => {
//     setMatched(new Set());
//     setSelectedId(null);
//     setShuffledTargets(shuffle(items));
//   }, [items]);

//   const isMatched = (id: string) => matched.has(id);
//   const allMatched = items.length > 0 && matched.size === items.length;

//   const reset = () => {
//     setMatched(new Set());
//     setSelectedId(null);
//     setShuffledTargets(shuffle(items));
//   };

//   // Click on LEFT column (known language)
//   const handleKnownClick = (id: string) => {
//     if (isMatched(id)) return;
//     setSelectedId(id);
//   };

//   // Click on RIGHT column (target language)
//   const handleTargetClick = (id: string) => {
//     if (!selectedId || isMatched(id)) return;

//     if (id === selectedId) {
//       // correct pair
//       const next = new Set(matched);
//       next.add(id);
//       setMatched(next);
//       setSelectedId(null);
//     } else {
//       // wrong pair -> just clear selection (you can add animations/toasts later)
//       setSelectedId(null);
//     }
//   };

//   if (!listId) return <div className="p-6">Missing list id.</div>;
//   if (loading) return <div className="p-6">Loading oasis…</div>;
//   if (items.length === 0)
//     return (
//       <div className="p-6">
//         <p className="mb-2">No words in this oasis yet.</p>
//         <p className="text-sm text-gray-500">
//           Add words in <strong>Edit Oasis</strong> to play Word Matcher.
//         </p>
//       </div>
//     );

//   if (allMatched) {
//     return (
//       <div className="p-6">
//         <h1 className="text-2xl font-bold mb-4">You Win! 🎉</h1>
//         <p className="mb-4">
//           Oasis: <strong>{meta?.name ?? "Oasis"}</strong> · Pairs matched: {matched.size}
//         </p>
//         <Button onClick={reset}>Play Again</Button>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       <h1 className="text-xl font-bold mb-4">
//         Word Matcher — {meta?.name ?? "Oasis"}
//       </h1>

//       <div className="flex gap-6">
//         {/* LEFT: Known language (English) */}
//         <div className="flex flex-col gap-2">
//           {items.map((m) => {
//             const selected = selectedId === m.id;
//             const matchedClass = isMatched(m.id) ? "bg-green-500" : "";
//             const selectedClass = selected ? "ring-2 ring-blue-500" : "";
//             return (
//               <Button
//                 key={m.id}
//                 onClick={() => handleKnownClick(m.id)}
//                 disabled={isMatched(m.id)}
//                 className={`${matchedClass} ${selectedClass}`}
//                 aria-label={m.known}
//               >
//                 {m.known}
//               </Button>
//             );
//           })}
//         </div>

//         {/* RIGHT: Target language (shuffled) */}
//         <div className="flex flex-col gap-2">
//           {shuffledTargets.map((m) => {
//             const matchedClass = isMatched(m.id) ? "bg-green-500" : "";
//             return (
//               <Button
//                 key={m.id}
//                 onClick={() => handleTargetClick(m.id)}
//                 disabled={isMatched(m.id)}
//                 className={matchedClass}
//                 aria-label={m.target}
//               >
//                 {m.target}
//               </Button>
//             );
//           })}
//         </div>
//       </div>

//       <div className="mt-4 flex gap-2 items-center text-sm text-gray-600">
//         <Button onClick={reset}>
//           New Shuffle
//         </Button>
//         <span>
//           Matched {matched.size} / {items.length}
//         </span>
//         {selectedId && <span className="italic">Select the matching target…</span>}
//       </div>
//     </div>
//   );
// }

// app/oasis/quiz/WordMatcher.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, type Variants } from "framer-motion";
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
    } else {
      // wrong — shake RIGHT tile
      setWrongKey(`${id}-${Date.now()}`);
      setSelectedId(null);
      setTimeout(() => setWrongKey(null), 350);
    }
  };

  if (!listId) return <div className="p-6">Missing list id.</div>;
  if (loading) return <div className="p-6">Loading oasis…</div>;
  if (items.length === 0) {
    return (
      <div className="p-6">
        <p className="mb-2">No words in this oasis yet.</p>
        <p className="text-sm text-gray-500">
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

        <Button onClick={reset} className="!rounded-lg !px-3 !py-1.5 !cursor-pointer">
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
            <Button onClick={reset} className="!rounded-lg !px-4 !py-2 !cursor-pointer">
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
              <div className="mb-2 text-sm font-semibold text-gray-700">English</div>
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
                      animate={isWrong ? { x: [0, -6, 6, -4, 4, 0] } : "show"}
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
          <div className="text-center text-xs text-gray-600 mt-1">
            Select a word on the left, then its translation on the right.
          </div>
        </>
      )}
    </div>
  );
}

// // app/oasis/quiz/WordMatcher.tsx
// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import { motion, type Variants } from "framer-motion";
// import { Button } from "@/app/components/Button";

// interface GoodMatch {
//   knownLanguage: string;
//   targetLanguage: string;
// }

// // Demo pairs (replace with API later)
// const preMatchedData: GoodMatch[] = [
//   { knownLanguage: "Dog",   targetLanguage: "Perro" },
//   { knownLanguage: "Cat",   targetLanguage: "Gato" },
//   { knownLanguage: "Fish",  targetLanguage: "Pez" },
//   { knownLanguage: "Tiger", targetLanguage: "Tigre" },
//   { knownLanguage: "Monkey",targetLanguage: "Mono" },
// ];

// const shuffleArray = (arr: GoodMatch[]) => arr.slice().sort(() => Math.random() - 0.5);

// const listContainer: Variants = {
//   hidden: { opacity: 0, y: 8 },
//   show: { opacity: 1, y: 0, transition: { staggerChildren: 0.05 } },
// };

// const item: Variants = {
//   hidden: { opacity: 0, y: 10, filter: "blur(3px)" },
//   show: {
//     opacity: 1,
//     y: 0,
//     filter: "blur(0px)",
//     transition: { type: "spring", stiffness: 160, damping: 14 },
//   },
// };

// export default function WordMatcher() {
//   const [shuffledData, setShuffledData] = useState<GoodMatch[]>(() =>
//     shuffleArray(preMatchedData)
//   );
//   const [selectedWord, setSelectedWord] = useState<GoodMatch | null>(null);
//   const [pairedData, setPairedData] = useState<GoodMatch[]>([]);
//   const [wrongKey, setWrongKey] = useState<string | null>(null);
//   const [round, setRound] = useState(1);

//   const total = preMatchedData.length;
//   const matchedCount = pairedData.length;
//   const win = matchedCount === total;

//   const progressPct = useMemo(
//     () => Math.round((matchedCount / total) * 100),
//     [matchedCount, total]
//   );

//   const isMatched = (m: GoodMatch) => pairedData.some((p) => p === m);

//   const isSelected = (m: GoodMatch) =>
//     selectedWord?.knownLanguage === m.knownLanguage &&
//     selectedWord?.targetLanguage === m.targetLanguage;

//   useEffect(() => {
//     // initial shuffle
//     setShuffledData(shuffleArray(preMatchedData));
//   }, []);

//   const handleTargetClick = (match: GoodMatch) => {
//     if (
//       selectedWord &&
//       match.knownLanguage === selectedWord.knownLanguage &&
//       match.targetLanguage === selectedWord.targetLanguage
//     ) {
//       // correct
//       setPairedData((prev) => [...prev, match]);
//       setSelectedWord(null);
//     } else {
//       // wrong: shake that tile
//       setWrongKey(`${match.knownLanguage}-${match.targetLanguage}-${Date.now()}`);
//       setSelectedWord(null);
//       setTimeout(() => setWrongKey(null), 350);
//     }
//   };

//   const reset = () => {
//     setSelectedWord(null);
//     setPairedData([]);
//     setShuffledData(shuffleArray(preMatchedData));
//     setWrongKey(null);
//     setRound((r) => r + 1);
//   };

//   return (
//     <div className="space-y-4">
//       {/* Top bar: progress + reset */}
//       <div className="flex flex-wrap items-center justify-between gap-3">
//         <div className="flex items-center gap-3 min-w-[12rem] grow">
//           <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden ring-1 ring-black/5">
//             <motion.div
//               key={matchedCount}
//               className="h-full bg-emerald-500"
//               initial={{ width: 0 }}
//               animate={{ width: `${progressPct}%` }}
//               transition={{ duration: 0.5 }}
//             />
//           </div>
//           <span className="text-xs font-medium text-gray-700">
//             {matchedCount}/{total}
//           </span>
//         </div>

//         <Button onClick={reset} className="!rounded-lg !px-3 !py-1.5 !cursor-pointer">
//           Reset
//         </Button>
//       </div>

//       {/* Win state */}
//       {win ? (
//         <motion.div
//           key={`win-${round}`}
//           initial={{ opacity: 0, y: 8, scale: 0.98 }}
//           animate={{ opacity: 1, y: 0, scale: 1 }}
//           transition={{ duration: 0.4 }}
//           className="rounded-xl bg-emerald-50 ring-1 ring-emerald-200 p-4 text-emerald-800"
//         >
//           <div className="flex items-center justify-between gap-3">
//             <div>
//               <h3 className="text-lg font-semibold">You win! 🎉</h3>
//               <p className="text-sm">
//                 Great matching—shuffle and play again or try another mode.
//               </p>
//             </div>
//             <Button onClick={reset} className="!rounded-lg !px-4 !py-2 !cursor-pointer">
//               Play again
//             </Button>
//           </div>
//         </motion.div>
//       ) : (
//         <>
//           {/* Board */}
//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//             {/* Left: Known language */}
//             <motion.div
//               key={`known-${round}`}
//               variants={listContainer}
//               initial="hidden"
//               animate="show"
//               className="rounded-xl bg-white/95 ring-1 ring-black/5 p-3 shadow-sm"
//             >
//               <div className="mb-2 text-sm font-semibold text-gray-700">English</div>
//               <div className="grid grid-cols-1 gap-2">
//                 {preMatchedData.map((m) => {
//                   const matched = isMatched(m);
//                   const selected = isSelected(m);
//                   return (
//                     <motion.div
//                       key={`known-${m.knownLanguage}`}
//                       variants={item}
//                       whileHover={{ y: matched ? 0 : -2 }}
//                       whileTap={{ scale: matched ? 1 : 0.98 }}
//                     >
//                       <Button
//                         onClick={() => setSelectedWord(m)}
//                         disabled={matched}
//                         aria-pressed={selected}
//                         aria-label={`Select ${m.knownLanguage}`}
//                         className={[
//                           "!w-full !justify-center !rounded-lg !px-4 !py-2 transition focus:!ring-2 focus:!ring-indigo-300",
//                           matched
//                             ? "bg-emerald-500 hover:bg-emerald-500 cursor-not-allowed !text-white"
//                             : selected
//                             ? "bg-indigo-500 hover:bg-indigo-500 !text-white !cursor-pointer"
//                             : "!bg-white hover:!bg-gray-50 !text-gray-900 border border-black/10 !cursor-pointer",
//                         ].join(" ")}
//                       >
//                         {m.knownLanguage}
//                       </Button>
//                     </motion.div>
//                   );
//                 })}
//               </div>
//             </motion.div>

//             {/* Right: Target language */}
//             <motion.div
//               key={`target-${round}`}
//               variants={listContainer}
//               initial="hidden"
//               animate="show"
//               className="rounded-xl bg-white/95 ring-1 ring-black/5 p-3 shadow-sm"
//             >
//               <div className="mb-2 text-sm font-semibold text-gray-700">Spanish</div>
//               <div className="grid grid-cols-1 gap-2">
//                 {shuffledData.map((m) => {
//                   const matched = isMatched(m);
//                   const wrong =
//                     wrongKey?.startsWith(`${m.knownLanguage}-${m.targetLanguage}`) ?? false;
//                   return (
//                     <motion.div
//                       key={`target-${m.targetLanguage}`}
//                       variants={item}
//                       animate={wrong ? { x: [0, -6, 6, -4, 4, 0] } : "show"}
//                       transition={wrong ? { duration: 0.35 } : undefined}
//                       whileHover={{ y: matched ? 0 : -2 }}
//                       whileTap={{ scale: matched ? 1 : 0.98 }}
//                     >
//                       <Button
//                         onClick={() => handleTargetClick(m)}
//                         disabled={matched}
//                         aria-label={`Choose ${m.targetLanguage}`}
//                         className={[
//                           "!w-full !justify-center !rounded-lg !px-4 !py-2 transition focus:!ring-2 focus:!ring-indigo-300",
//                           matched
//                             ? "bg-emerald-500 hover:bg-emerald-500 cursor-not-allowed !text-white"
//                             : "!bg-white hover:!bg-gray-50 !text-gray-900 border border-black/10 !cursor-pointer",
//                         ].join(" ")}
//                       >
//                         {m.targetLanguage}
//                       </Button>
//                     </motion.div>
//                   );
//                 })}
//               </div>
//             </motion.div>
//           </div>

//           {/* Helper hint */}
//           <div className="text-center text-xs text-gray-600 mt-1">
//             Select a word on the left, then its translation on the right.
//           </div>
//         </>
//       )}
//     </div>
//   );
// }
