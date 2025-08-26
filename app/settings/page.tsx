"use client";

import { useState, useEffect } from "react";
import { Button } from "../components/Button";
import { LinkAsButton } from "../components/LinkAsButton";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function SettingsPage() {
  const supabase = createClientComponentClient()
  const [language, setLanguage] = useState("Japanese");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [isDarkMode, setIsDarkMode] = useState(false); // add boolean state

  useEffect(() => {
    // Load previous values if available (for now localStorage fallback)
    const storedLang = localStorage.getItem("targetLanguage");
    const storedDiff = localStorage.getItem("difficultyLevel");
    const storedDisplay = localStorage.getItem("display");

    if (storedLang) setLanguage(storedLang);
    if (storedDiff) setDifficulty(storedDiff);
    if (storedDisplay !== null) setIsDarkMode(storedDisplay === "true"); // string → boolean
  }, []);

  const saveSettings = async () => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        alert("Not authenticated!")
        return
      }

      // Save to Supabase
      const { error } = await supabase
        .from('UserSettings')
        .upsert({
          user_id: user.id,
          language,
          difficulty,
          display: isDarkMode,
        })

      if (error) {
        console.error('Save error:', error)
        alert("Failed to save settings")
        return
      }

      // Save to localStorage as fallback
      localStorage.setItem("targetLanguage", language)
      localStorage.setItem("difficultyLevel", difficulty)
      localStorage.setItem("display", String(isDarkMode))

      alert("✅ Settings saved!")
    } catch (e) {
      console.error('Unexpected error:', e)
      alert("Failed to save settings")
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Settings</h1>

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

      {/* Dark Mode Toggle */}
      <div className="mb-4 flex items-center gap-2">
        <input
          type="checkbox"
          checked={isDarkMode}
          onChange={(e) => setIsDarkMode(e.target.checked)}
        />
        <label>Dark Mode</label>
      </div>

      <div className="flex flex-col gap-2 items-center">
        <Button onClick={saveSettings}>Save Settings</Button>
        <LinkAsButton href="/home">Back</LinkAsButton>
      </div>
    </div>
  );
}
