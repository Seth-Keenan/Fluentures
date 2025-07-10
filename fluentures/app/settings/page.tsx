"use client";

import { redirect } from "next/navigation";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [language, setLanguage] = useState("Japanese");
  const [difficulty, setDifficulty] = useState("Beginner");

  useEffect(() => {
    // Load previous values if available
    const storedLang = localStorage.getItem("targetLanguage");
    const storedDiff = localStorage.getItem("difficultyLevel");
    if (storedLang) setLanguage(storedLang);
    if (storedDiff) setDifficulty(storedDiff);
  }, []);

  const saveSettings = () => {
    localStorage.setItem("targetLanguage", language);
    localStorage.setItem("difficultyLevel", difficulty);
    alert("Settings saved! Close to continue.");
    redirect("/");
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <h1 className="text-xl font-bold mb-4">Settings</h1>

      <div className="mb-4">
        <label className="block">Target Language:</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="border p-2"
        >
          <option value="Japanese">Japanese</option>
          <option value="Spanish">Spanish</option>
          <option value="English">English</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block">Difficulty:</label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="border p-2"
        >
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      <button
        onClick={saveSettings}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Save Settings
      </button>
    </div>
  );
}