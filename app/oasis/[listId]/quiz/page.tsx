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
    <div className="flex flex-col gap-4 justify-center items-center h-screen">
      {/* QUIZ SELECTION MENU */}
      {selectedQuiz === null && (
        <>
          <h1 className="text-4xl font-bold">Choose a Quiz</h1>

          <Button onClick={() => setSelectedQuiz("matching")}>Matching Tiles</Button>
          <Button onClick={() => setSelectedQuiz("written")}>Written Quiz</Button>

          {/* Back to THIS oasis */}
          {listId ? (
            <LinkAsButton href={`/oasis/${listId}`} className="btn">
              Back
            </LinkAsButton>
          ) : (
            <LinkAsButton href="/oasis" className="btn">
              Back
            </LinkAsButton>
          )}
        </>
      )}

      {/* MATCHING QUIZ */}
      {selectedQuiz === "matching" && <WordMatcher />}

      {/* WRITTEN QUIZ */}
      {selectedQuiz === "written" && <WrittenQuiz />}

      {/* INSIDE A QUIZ — Back to quiz selector */}
      {selectedQuiz !== null && (
        <Button onClick={handleBackToChooser}>Back</Button>
      )}
    </div>
  );
}
