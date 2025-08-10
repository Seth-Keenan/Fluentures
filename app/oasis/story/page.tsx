"use client";
import { useState } from 'react';
import { useSettings } from "@/app/lib/hooks/useSettings";
import { Button } from '@/app/components/Button';
import { LinkAsButton } from '@/app/components/LinkAsButton';
import { requestStory, sendStoryChat } from "@/app/lib/actions/geminiStoryAction";
import type { HistoryItem } from "@/app/types/gemini";


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
  // Call from app/lib/actions/geminiStoryClient.ts
  const generateStory = async () => {
    setStory("Generating...");
    setChatLog([]);
    const newStory = await requestStory(language, difficulty);
    setStory(newStory ?? "Failed to generate story.");
  };


const sendChat = async () => {
  if (!chatInput.trim() || isLoading) return;

  setIsLoading(true);
  const currentInput = chatInput;
  setChatLog(prev => [...prev, `You: ${currentInput}`]);
  setChatInput('');

  const storyContext: HistoryItem = {
    role: 'user',
    parts: [{ text: `Here is a story. All my next questions will be about this story. Do not forget it. Story: """${story}"""` }],
  };
  const modelContextConfirmation: HistoryItem = {
    role: 'model',
    parts: [{ text: "Okay, I have the story. I will answer your questions about it." }],
  };

  const historyForApi = (apiHistory.length === 0)
    ? [storyContext, modelContextConfirmation]
    : apiHistory;

  const modelReply = await sendStoryChat(currentInput, historyForApi);

  if (modelReply) {
    setChatLog(prev => [...prev, `Camel: ${modelReply}`]);
    setApiHistory(prev => [
      ...prev,
      { role: 'user', parts: [{ text: currentInput }] },
      { role: 'model', parts: [{ text: modelReply }] },
    ]);
  } else {
    setChatLog(prev => [...prev, "Error: No response received."]);
  }

  setIsLoading(false);
};

  return (
    <div className="p-6 min-h-screen">
      <LinkAsButton href='/oasis'>
        Back
      </LinkAsButton>
      <div className='flex flex-row'>
        <div className='flex flex-col flex-1'>
          <h1 className="text-xl font-bold">Story Generator</h1>
          <textarea className="p-2 border resize-none" value={story} readOnly />
          <Button onClick={generateStory} >Generate</Button>
        </div>

        <div className='flex flex-col flex-1'>
          <h1 className="text-xl font-semibold">Chat</h1>
          <textarea className="p-2 border resize-none" value={chatLog.join('\n')} readOnly />
          <input
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            className="border p-2"
          />
          <Button onClick={sendChat}>Send</Button>
        </div>
      </div>

    </div>
  );
}
// This code defines a simple Next.js page that allows users to generate a story in a selected language
// and chat with a simulated Gemini-like API. It uses React hooks for state management and fetches data from an API endpoint.