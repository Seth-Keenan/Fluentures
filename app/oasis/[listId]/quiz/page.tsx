"use client";

import React, { useState } from "react";
import { Button } from "@/app/components/Button";
import { LinkAsButton } from "@/app/components/LinkAsButton";
import WordMatcher from "./WordMatcher";
import WrittenQuiz from "./WrittenQuiz";
import { useListId } from "@/app/lib/hooks/useListId";

export default function Quiz() {
  const [selectedQuiz, setSelectedQuiz] = useState<"matching" | "written" | null>(null);
  const listId = useListId();

  const handleBackToChooser = () => setSelectedQuiz(null);

return (
  <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
    <div className="mx-auto flex max-w-4xl flex-col items-stretch gap-6">
      {/* QUIZ SELECTION MENU */}
      {selectedQuiz === null && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Choose a Quiz</h1>
          </div>

          <div className="mx-auto grid max-w-md gap-3 sm:grid-cols-2">
            <Button onClick={() => setSelectedQuiz("matching")} className="px-4 py-3">
              Matching Tiles
            </Button>
            <Button onClick={() => setSelectedQuiz("written")} className="px-4 py-3">
              Written Quiz
            </Button>
          </div>

          <div className="mt-6 flex justify-center">
            {listId ? (
              <LinkAsButton href={`/oasis/${listId}`} className="px-5 py-2">
                Back
              </LinkAsButton>
            ) : (
              <LinkAsButton href="/oasis" className="px-5 py-2">
                Back
              </LinkAsButton>
            )}
          </div>
        </section>
      )}

      {/* MATCHING QUIZ */}
      {selectedQuiz === "matching" && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight md:text-xl">Matching Tiles</h2>
            <Button onClick={handleBackToChooser}>Back</Button>
          </div>
          <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
            <WordMatcher />
          </div>
        </section>
      )}

      {/* WRITTEN QUIZ */}
      {selectedQuiz === "written" && (
        <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight md:text-xl">Written Quiz</h2>
            <Button onClick={handleBackToChooser}>Back</Button>
          </div>
          <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
            <WrittenQuiz />
          </div>
        </section>
      )}
    </div>
  </div>
);

}
