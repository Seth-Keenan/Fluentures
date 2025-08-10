"use client";

import { Button } from "@/app/components/Button";
import { useEffect, useState } from "react";
import { requestQuizSentence } from "@/app/lib/actions/geminiQuizClient";

// Simulated word list (target language: Japanese)
const wordList = [
  { target: "りんご", english: "apple" },
  { target: "ねこ", english: "cat" },
  { target: "みず", english: "water" },
  { target: "いぬ", english: "dog" },
  { target: "やま", english: "mountain" },
];

const language = "Japanese";
const difficulty = "Beginner";

type Mode = "en-to-target" | "target-to-en";

// QuizPage component
// This component allows users to select quiz settings and start a quiz.
export default function QuizPage() {
    const [mode, setMode] = useState<Mode>("en-to-target");
    const [questionCount, setQuestionCount] = useState(5);
    const [quizStarted, setQuizStarted] = useState(false);

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [input, setInput] = useState("");
    const [answerSubmitted, setAnswerSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState(0);

    const [quizWords, setQuizWords] = useState<typeof wordList>([]);

    const [exampleSentence, setExampleSentence] = useState<string | null>(null);
    const [sentenceLoading, setSentenceLoading] = useState(false);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    if (!mounted) {
      return <p className="p-6">Loading...</p>;
    }

  // Function to start the quiz with selected settings
  const startQuiz = () => {
    const shuffled = [...wordList].sort(() => Math.random() - 0.5);
    setQuizWords(shuffled.slice(0, questionCount));
    setCurrentQuestion(0);
    setScore(0);
    setInput("");
    setAnswerSubmitted(false);
    setIsCorrect(null);
    setQuizStarted(true);
  };

  const checkAnswer = () => {
    const current = quizWords[currentQuestion];
    const correctAnswer = mode === "en-to-target" ? current.target : current.english;
    const isRight = input.trim() === correctAnswer;
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

    // Updated log to reflect manual settings
    console.log("✅ Using settings:", language, difficulty);

    const word = quizWords[currentQuestion].target;
    const sentence = await requestQuizSentence(word, language, difficulty);
    setExampleSentence(sentence ?? "No example sentence available.");
    setSentenceLoading(false);
  };


  // Reset quiz to initial state
  const restartQuiz = () => {
    setQuizStarted(false);
  };

  // When quiz is finished
  if (quizStarted && currentQuestion >= quizWords.length) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Quiz Complete!</h2>
        <p className="mb-4">Your score: {score} / {quizWords.length}</p>
        <button onClick={restartQuiz} className="bg-blue-500 text-white px-4 py-2 mr-2 rounded">Restart</button>
        <button onClick={() => window.location.href = "/"} className="bg-gray-500 text-white px-4 py-2 rounded">Quit</button>
      </div>
    );
  }

  // If quiz hasn't started yet, show settings
  if (!quizStarted) {
    return (
      <div className="flex flex-col p-6">
        <h1 className="text-4xl font-bold mb-4">Start Your Quiz</h1>

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

        <Button
          onClick={startQuiz}>
          Start Quiz
        </Button>
      </div>
    );
  }


    let current, prompt, correctAnswer;
    if (quizStarted) {
      current = quizWords[currentQuestion];
      prompt = mode === "en-to-target" ? current.english : current.target;
      correctAnswer = mode === "en-to-target" ? current.target : current.english;
    }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Question {currentQuestion + 1} / {quizWords.length}</h2>
      <p className="mb-2">Translate: <span className="font-semibold">{prompt}</span></p>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={answerSubmitted}
        className={`border p-2 w-full mb-2 ${answerSubmitted && !isCorrect ? "border-red-500" : ""}`}
      />

      <div className="mb-4">
        <button
          onClick={checkAnswer}
          disabled={answerSubmitted}
          className="bg-green-500 text-white px-4 py-2 mr-2 rounded"
        >
          Submit
        </button>

        <button
          disabled={!answerSubmitted}
          onClick={nextQuestion}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Next
        </button>

        <button
            onClick={getSentence}
            disabled={sentenceLoading}
            className="bg-purple-500 text-white px-4 py-2 rounded"
        >
            {sentenceLoading ? "Generating..." : "Sentence"}
        </button>
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