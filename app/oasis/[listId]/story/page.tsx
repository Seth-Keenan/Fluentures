"use client";
import { useState } from "react";
//import { useSettings } from "@/app/lib/hooks/useSettings";
import { useOasisData } from "@/app/lib/hooks/useOasis";
import { Button } from "@/app/components/Button";
import { LinkAsButton } from "@/app/components/LinkAsButton";
import { requestStory, sendStoryChat } from "@/app/lib/actions/geminiStoryAction";
import type { HistoryItem } from "@/app/types/gemini";

// typed helpers so role is "user" | "model"
const toUser = (text: string): HistoryItem => ({ role: "user", parts: [{ text }] });
const toModel = (text: string): HistoryItem => ({ role: "model", parts: [{ text }] });

// helper: build a brief vocab prompt from your list
function buildVocabHint(words: { target: string; english: string }[], max = 20) {
  const trimmed = words.slice(0, max).map(w => `${w.target} = ${w.english}`).join(", ");
  return trimmed ? `Use these vocabulary items where natural: ${trimmed}.` : "";
}

export default function StoryPage() {
  const { listId, meta, words, loading } = useOasisData();

  const [story, setStory] = useState("");
  const [chatLog, setChatLog] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiHistory, setApiHistory] = useState<HistoryItem[]>([]);

  if (!listId) return <p className="p-6">Missing list id.</p>;
  if (loading) return <p className="p-6">Loading oasis…</p>;

  // Generate a new story, scoped to this oasis
  const generateStory = async () => {
    setStory("Generating…");
    setChatLog([]);
    setApiHistory([]);

    // pass context to your server action
    const vocabHint = buildVocabHint(words, 20);
    const res = await requestStory({
      listId,
      language: meta?.language ?? undefined,
      vocabHint,
    });

    const storyText =
      typeof res === "string" ? res : res?.story ?? "Failed to generate story.";
    setStory(storyText);
  };

  const sendChat = async () => {
    if (!chatInput.trim() || isLoading) return;

    setIsLoading(true);
    const currentInput = chatInput;
    setChatLog(prev => [...prev, `You: ${currentInput}`]);
    setChatInput("");

    const seededContext: HistoryItem[] = [
      toUser(
        `Here is the story for Oasis "${meta?.name ?? ""}" (id: ${listId}). Use the same language and reference these vocabulary items when helpful. Story: """${story}""". ${buildVocabHint(words, 20)}`
      ),
      toModel("Okay, I have the story and vocabulary. I will answer your questions about it."),
    ];
    const historyForApi = apiHistory.length === 0 ? seededContext : apiHistory;

    const reply = await sendStoryChat(currentInput, historyForApi, { listId });
    const replyText = typeof reply === "string" ? reply : reply?.text ?? null;

    if (replyText) {
      setChatLog(prev => [...prev, `Camel: ${replyText}`]);
      setApiHistory([...historyForApi, toUser(currentInput), toModel(replyText)]);
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