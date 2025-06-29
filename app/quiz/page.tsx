"use client";

import { useState } from "react";

// Simulated word list (target language: Japanese)
const wordList = [
  { target: "りんご", english: "apple" },
  { target: "ねこ", english: "cat" },
  { target: "みず", english: "water" },
  { target: "いぬ", english: "dog" },
  { target: "やま", english: "mountain" },
];

type Mode = "en-to-target" | "target-to-en";

export default function QuizPage() {
  const [mode, setMode] = useState<Mode>("en-to-target");
  const [questionCount, setQuestionCount] = useState(5);
  const [quizStarted, setQuizStarted] = useState(false);

  const startQuiz = () => {
    setQuizStarted(true);
    // Quiz state will be handled in the next step
  };

  if (!quizStarted) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Start Your Quiz</h1>

        <label className="block mb-2">Number of Questions:</label>
        <select
          value={questionCount}
          onChange={(e) => setQuestionCount(Number(e.target.value))}
          className="border p-2 mb-4"
        >
          {[5, 10, 15, 20].map((num) => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>

        <label className="block mb-2">Mode:</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as Mode)}
          className="border p-2 mb-4"
        >
          <option value="en-to-target">English → Target Language</option>
          <option value="target-to-en">Target Language → English</option>
        </select>

        <button
          onClick={startQuiz}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Start Quiz
        </button>
      </div>
    );
  }

  // TODO: Quiz logic goes here
  return <div className="p-6">[Quiz UI coming next]</div>;
}
