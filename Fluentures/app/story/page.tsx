"use client";
import { useState } from 'react';

export default function StoryPage() {
  const [language, setLanguage] = useState('Japanese');
  const [story, setStory] = useState('');
  const [chatLog, setChatLog] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState('');

  const generateStory = async () => {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate', input: language }),
    });
    const data = await res.json();
    setStory(data.story);
  };

  const sendChat = async () => {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'chat', input: chatInput }),
    });
    const data = await res.json();
    setChatLog([...chatLog, `You: ${chatInput}`, `Gemini: ${data.reply}`]);
    setChatInput('');
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Story Generator</h1>

      <select value={language} onChange={e => setLanguage(e.target.value)} className="border p-2 m-2">
        <option value="Japanese">Japanese</option>
        <option value="English">English</option>
      </select>
      <button onClick={generateStory} className="bg-blue-500 text-white px-4 py-2 rounded">Generate</button>

      <textarea className="w-full mt-4 border p-2" rows={6} value={story} readOnly />

      <h2 className="mt-6 font-semibold">Chat</h2>
      <div className="border p-2 mb-2 h-40 overflow-y-scroll">
        {chatLog.map((line, i) => <div key={i}>{line}</div>)}
      </div>
      <input
        value={chatInput}
        onChange={e => setChatInput(e.target.value)}
        className="border p-2 w-3/4"
      />
      <button onClick={sendChat} className="bg-green-500 text-white px-4 py-2 ml-2 rounded">Send</button>
    </div>
  );
}
// This code defines a simple Next.js page that allows users to generate a story in a selected language
// and chat with a simulated Gemini-like API. It uses React hooks for state management and fetches data from an API endpoint.