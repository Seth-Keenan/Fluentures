"use client";

import { Button } from '@/app/components/Button';
import React, { useState } from 'react'
import WordMatcher from './WordMatcher';
import WrittenQuiz from './WrittenQuiz';
import { LinkAsButton } from '@/app/components/LinkAsButton';

const Quiz = () => {
  const [selectedQuiz, setSelectedQuiz] = useState<'matching' | 'written' | null>(null);

  const handleBack = () => {
    setSelectedQuiz(null);
  };

  return (
    <>
      <div className="flex flex-col gap-4 justify-center items-center h-screen">
      {selectedQuiz === null && (
        <>
          <h1 className="text-4xl font-bold">Choose a Quiz</h1>
          <Button onClick={() => setSelectedQuiz('matching')}>Matching Tiles</Button>
          <Button onClick={() => setSelectedQuiz('written')}>Written Quiz</Button>
          <LinkAsButton href='/oasis'>
            Back
          </LinkAsButton>
        </>
      )}

      {selectedQuiz === 'matching' && <WordMatcher />}
      {selectedQuiz === 'written' && <WrittenQuiz />}

      {selectedQuiz !== null && (
        <Button onClick={handleBack}>
          Back
        </Button>
      )}
    </div>
    </>
  )
}

export default Quiz