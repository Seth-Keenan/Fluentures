"use client";
import { useState } from 'react';
import { useSettings } from "@/lib/hooks/useSettings";

interface HistoryItem {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export default function StoryPage() {
  const { language, difficulty } = useSettings();
  const [story, setStory] = useState('');
  const [chatLog, setChatLog] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiHistory, setApiHistory] = useState<HistoryItem[]>([]);


  if (!language || !difficulty) {
    return <p className="p-6">Loading your settings...</p>;
  }

  // Function to generate a new story based on the selected language and difficulty
  const generateStory = async () => {
    setStory('Generating...');
    setChatLog([]); 

    const res = await fetch('/api/story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: "generate",
        language: language,
        difficulty: difficulty
      }),
    });
    const data = await res.json();
    setStory(data.story);
  };


const sendChat = async () => {
  if (!chatInput.trim() || isLoading) return;

  setIsLoading(true);
  const currentInput = chatInput;
  setChatLog(prev => [...prev, `You: ${currentInput}`]);
  setChatInput('');

  // Conversational context
  const storyContext: HistoryItem = {
      role: 'user',
      parts: [{ text: `Here is a story. All my next questions will be about this story. Do not forget it. Story: """${story}"""` }]
  };
  
  const modelContextConfirmation: HistoryItem = {
      role: 'model',
      parts: [{ text: "Okay, I have the story. I will answer your questions about it."}]
  }

  const historyForApi = (apiHistory.length === 0) 
    ? [storyContext, modelContextConfirmation] 
    : apiHistory;

  try {
    const res = await fetch('/api/story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        input: currentInput,
        history: historyForApi 
      }),
    });

    // ERROR HANDLING LOGIC
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'An unknown error occurred on the server.');
    }

    const modelReply = data.reply || 'Sorry, I could not respond.';

    setChatLog(prev => [...prev, `Camel: ${modelReply}`]);
    setApiHistory(prev => [
        ...prev,
        { role: 'user', parts: [{ text: currentInput }] },
        { role: 'model', parts: [{ text: modelReply }] }
    ]);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error("Chat error:", errorMessage);
    setChatLog(prev => [...prev, `Error: ${errorMessage}`]);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Story Generator</h1>

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