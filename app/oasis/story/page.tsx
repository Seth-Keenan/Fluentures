"use client";
import { useState } from "react";
import { useSettings } from "@/app/lib/hooks/useSettings";
import { Button } from "@/app/components/Button";
import { LinkAsButton } from "@/app/components/LinkAsButton";
import { requestStory, sendStoryChat } from "@/app/lib/actions/geminiStoryAction";
import type { HistoryItem } from "@/app/types/gemini";

// typed helpers so role is "user" | "model"
const toUser = (text: string): HistoryItem => ({ role: "user", parts: [{ text }] });
const toModel = (text: string): HistoryItem => ({ role: "model", parts: [{ text }] });

export default function StoryPage() {
  const { language, difficulty, isLoading: settingsLoading } = useSettings();
  const [story, setStory] = useState("");
  const [chatLog, setChatLog] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiHistory, setApiHistory] = useState<HistoryItem[]>([]);

  if (settingsLoading) {
    return <p className="p-6">Loading your settings...</p>;
  }

  if (!language || !difficulty) {
    return <p className="p-6">Error loading settings. Please try refreshing.</p>;
  }

  // Generate a new story (server reads settings from DB)
  const generateStory = async () => {
    setStory("Generating...");
    setChatLog([]);
    setApiHistory([]); // reset chat context for the new story
    const newStory = await requestStory();
    // If newStory is an object with a 'story' property, use it; otherwise, use the string or fallback
    const storyText =
      typeof newStory === "string"
        ? newStory
        : newStory?.story ?? "Failed to generate story.";
    setStory(storyText);
  };

  const sendChat = async () => {
    if (!chatInput.trim() || isLoading) return;

    setIsLoading(true);
    const currentInput = chatInput;
    setChatLog((prev) => [...prev, `You: ${currentInput}`]);
    setChatInput("");

    // Seed the story context once
    const seededContext: HistoryItem[] = [
      toUser(
        `Here is a story. All my next questions will be about this story. Do not forget it. Story: """${story}"""`
      ),
      toModel("Okay, I have the story. I will answer your questions about it."),
    ];

    const historyForApi: HistoryItem[] = apiHistory.length === 0 ? seededContext : apiHistory;

    const modelReply = await sendStoryChat(currentInput, historyForApi);
    // Normalize reply to a string
    const replyText =
      typeof modelReply === "string" ? modelReply : modelReply?.text ?? null;

    if (replyText) {
      setChatLog((prev) => [...prev, `Camel: ${replyText}`]);
      // no unused "prev" — pass the new array directly
      setApiHistory([
        ...historyForApi,
        toUser(currentInput),
        toModel(replyText),
      ]);
    } else {
      setChatLog((prev) => [...prev, "Error: No response received."]);
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