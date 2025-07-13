"use client";
import { useState } from 'react';
import { useSettings } from "@/app/lib/hooks/useSettings";
import { Button } from '@/app/components/Button';
import { LinkAsButton } from '@/app/components/LinkAsButton';
import { ButtonAsLink } from '@/app/components/ButtonAsLink';
import { TextArea } from '@/app/components/TextArea';
import { Chat } from '@/app/components/Chat';

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
    <div className="p-6 min-h-screen">
      <LinkAsButton href='/oasis'>
        Back
      </LinkAsButton>
      <div className='flex flex-row gap-4'>
        <div className='flex flex-col flex-1 basis-2/3 gap-2'>
          <h1 className="text-xl font-bold text-center">Story Generator</h1>
          <TextArea value={story} readOnly disabled placeholder={"Generate a story using AI here!"}/>
          <ButtonAsLink onClick={generateStory}>Click here to generate another story!</ButtonAsLink>
        </div>

        <div className="w-px bg-gray-400"></div>

        <div className='flex flex-col flex-1 basis-1/3 gap-2'>
          <h1 className="text-xl font-semibold text-center">Chat</h1>
          {/* TODO: Maybe we can figure out how to center this placeholder? */}
          <Chat value={chatLog.join('\n')} readOnly disabled placeholder={"Ask a question about this story!"}/>
          <div className="h-px bg-gray-400"></div>
          <div className='flex gap-2 items-center'>
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              className="flex-1 border p-2 rounded-lg focus:outline-none"/>
            {/* TODO: Add some error checking here to not make api call until if no story */}
            {/* TODO: TONE THIS AI DOWN ITS YAPPING SO MUCH */}
            <Button onClick={sendChat} className='px-4 py-2 rounded-lg'>Send</Button>
          </div>
          
        </div>
      </div>

    </div>
  );
}
// This code defines a simple Next.js page that allows users to generate a story in a selected language
// and chat with a simulated Gemini-like API. It uses React hooks for state management and fetches data from an API endpoint.