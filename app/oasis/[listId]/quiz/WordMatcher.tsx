"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/app/components/Button";
import { useOasisData } from "@/app/lib/hooks/useOasis";

type MatchItem = {
  id: string;
  known: string;   // English (known language)
  target: string;  // Target language word
};

// Fisher–Yates-ish shuffle for a new target order each round
function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function WordMatcher() {
  const { listId, meta, words, loading } = useOasisData();

  // Build match items from the oasis words (filter blanks)
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

  const [shuffledTargets, setShuffledTargets] = useState<MatchItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null); // pick from LEFT (known)
  const [matched, setMatched] = useState<Set<string>>(new Set());    // store matched by id

  // Initialize / reinitialize when oasis changes
  useEffect(() => {
    setMatched(new Set());
    setSelectedId(null);
    setShuffledTargets(shuffle(items));
  }, [items]);

  const isMatched = (id: string) => matched.has(id);
  const allMatched = items.length > 0 && matched.size === items.length;

  const reset = () => {
    setMatched(new Set());
    setSelectedId(null);
    setShuffledTargets(shuffle(items));
  };

  // Click on LEFT column (known language)
  const handleKnownClick = (id: string) => {
    if (isMatched(id)) return;
    setSelectedId(id);
  };

  // Click on RIGHT column (target language)
  const handleTargetClick = (id: string) => {
    if (!selectedId || isMatched(id)) return;

    if (id === selectedId) {
      // correct pair
      const next = new Set(matched);
      next.add(id);
      setMatched(next);
      setSelectedId(null);
    } else {
      // wrong pair -> just clear selection (you can add animations/toasts later)
      setSelectedId(null);
    }
  };

  if (!listId) return <div className="p-6">Missing list id.</div>;
  if (loading) return <div className="p-6">Loading oasis…</div>;
  if (items.length === 0)
    return (
      <div className="p-6">
        <p className="mb-2">No words in this oasis yet.</p>
        <p className="text-sm text-gray-500">
          Add words in <strong>Edit Oasis</strong> to play Word Matcher.
        </p>
      </div>
    );

  if (allMatched) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">You Win! 🎉</h1>
        <p className="mb-4">
          Oasis: <strong>{meta?.name ?? "Oasis"}</strong> · Pairs matched: {matched.size}
        </p>
        <Button onClick={reset}>Play Again</Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">
        Word Matcher — {meta?.name ?? "Oasis"}
      </h1>

      <div className="flex gap-6">
        {/* LEFT: Known language (English) */}
        <div className="flex flex-col gap-2">
          {items.map((m) => {
            const selected = selectedId === m.id;
            const matchedClass = isMatched(m.id) ? "bg-green-500" : "";
            const selectedClass = selected ? "ring-2 ring-blue-500" : "";
            return (
              <Button
                key={m.id}
                onClick={() => handleKnownClick(m.id)}
                disabled={isMatched(m.id)}
                className={`${matchedClass} ${selectedClass}`}
                aria-label={m.known}
              >
                {m.known}
              </Button>
            );
          })}
        </div>

        {/* RIGHT: Target language (shuffled) */}
        <div className="flex flex-col gap-2">
          {shuffledTargets.map((m) => {
            const matchedClass = isMatched(m.id) ? "bg-green-500" : "";
            return (
              <Button
                key={m.id}
                onClick={() => handleTargetClick(m.id)}
                disabled={isMatched(m.id)}
                className={matchedClass}
                aria-label={m.target}
              >
                {m.target}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex gap-2 items-center text-sm text-gray-600">
        <Button onClick={reset}>
          New Shuffle
        </Button>
        <span>
          Matched {matched.size} / {items.length}
        </span>
        {selectedId && <span className="italic">Select the matching target…</span>}
      </div>
    </div>
  );
}
