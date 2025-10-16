"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/app/components/Button";
import { useOasisData } from "@/app/lib/hooks/useOasis";
import { requestQuizSentence } from "@/app/lib/actions/geminiQuizAction";

type Mode = "en-to-target" | "target-to-en";

export default function QuizPage() {
  const { listId, meta, words, loading } = useOasisData();

  // Build quiz pool from the oasis words
  const pool = useMemo(
    () => words.map(w => ({ target: (w.target ?? "").trim(), english: (w.english ?? "").trim() }))
               .filter(w => w.target && w.english),
    [words]
  );

  const [mode, setMode] = useState<Mode>("en-to-target");
  const [questionCount, setQuestionCount] = useState(5);
  const [quizStarted, setQuizStarted] = useState(false);

  const [quizWords, setQuizWords] = useState<typeof pool>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [input, setInput] = useState("");
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);

  const [exampleSentence, setExampleSentence] = useState<string | null>(null);
  const [sentenceLoading, setSentenceLoading] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <p className="p-6">Loading…</p>;
  if (!listId) return <div className="p-6">Missing list id.</div>;
  if (loading) return <div className="p-6">Loading oasis…</div>;

  const startQuiz = () => {
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setQuizWords(shuffled.slice(0, Math.min(questionCount, shuffled.length)));
    setCurrentQuestion(0);
    setScore(0);
    setInput("");
    setAnswerSubmitted(false);
    setIsCorrect(null);
    setExampleSentence(null);
    setQuizStarted(true);
  };

  // simple normalization
  const norm = (s: string) => s.trim().toLowerCase();

  const checkAnswer = () => {
    const current = quizWords[currentQuestion];
    const correctAnswer = mode === "en-to-target" ? current.target : current.english;
    const isRight = norm(input) === norm(correctAnswer);
    setIsCorrect(isRight);
    setAnswerSubmitted(true);
    if (isRight) setScore((prev) => prev + 1);
  };

  const nextQuestion = () => {
    setCurrentQuestion((prev) => prev + 1);
    setInput("");
    setAnswerSubmitted(false);
    setIsCorrect(null);
    setExampleSentence(null);
  };

  const getSentence = async () => {
    setSentenceLoading(true);
    setExampleSentence(null);
    const word = quizWords[currentQuestion].target;
    const sentence = await requestQuizSentence({ listId, word, language: meta?.language ?? undefined });
    setExampleSentence(sentence ?? "No example sentence available.");
    setSentenceLoading(false);
  };

  const restartQuiz = () => setQuizStarted(false);

  if (quizStarted && currentQuestion >= quizWords.length) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Quiz Complete!</h2>
        <p className="mb-4">Your score: {score} / {quizWords.length}</p>
        <Button onClick={restartQuiz} className="mr-2">Restart</Button>
        <Button onClick={() => (window.location.href = `/oasis/${listId}`)}>Back</Button>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="flex flex-col p-6">
        <h1 className="text-4xl font-bold mb-4">Start Your Quiz — {meta?.name ?? "Oasis"}</h1>

        <label htmlFor="question-count-select" className="block mb-2 font-bold">Number of Questions:</label>
        <select
          id="question-count-select"
          value={questionCount}
          onChange={(e) => setQuestionCount(Number(e.target.value))}
          className="border p-2 mb-4"
        >
          {[5, 10, 15, 20].map((num) => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>

        <label htmlFor="mode-select" className="block mb-2 font-bold">Mode:</label>
        <select
          id="mode-select"
          value={mode}
          onChange={(e) => setMode(e.target.value as Mode)}
          className="border p-2 mb-4"
        >
          <option value="en-to-target">English → Target Language</option>
          <option value="target-to-en">Target Language → English</option>
        </select>

        <Button onClick={startQuiz} disabled={pool.length === 0}>
          {pool.length ? "Start Quiz" : "Add words in Edit Oasis first"}
        </Button>
      </div>
    );
  }

  const current = quizWords[currentQuestion];
  const prompt = mode === "en-to-target" ? current.english : current.target;
  const correctAnswer = mode === "en-to-target" ? current.target : current.english;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">
        Question {currentQuestion + 1} / {quizWords.length}
      </h2>
      <p className="mb-2">Translate: <span className="font-semibold">{prompt}</span></p>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={answerSubmitted}
        className={`border p-2 w-full mb-2 ${answerSubmitted && !isCorrect ? "border-red-500" : ""}`}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Button onClick={checkAnswer} disabled={answerSubmitted}>Submit</Button>
        <Button disabled={!answerSubmitted} onClick={nextQuestion}>Next</Button>
        <Button onClick={getSentence} disabled={sentenceLoading}>
          {sentenceLoading ? "Generating..." : "Sentence"}
        </Button>
      </div>

      {answerSubmitted && (
        <div className="mb-4">
          {isCorrect ? (
            <p className="text-green-600 font-semibold">Correct!</p>
          ) : (
            <p className="text-red-600">Incorrect. The correct answer is: <strong>{correctAnswer}</strong></p>
          )}
        </div>
      )}

      {exampleSentence && (
        <p className="italic text-gray-700 mb-4">Example: {exampleSentence}</p>
      )}

      <p>Score: {score} / {quizWords.length}</p>
    </div>
  );
}
