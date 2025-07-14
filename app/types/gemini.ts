// Defines types related to the Gemini interactions

// Used for keeping chat memory in the story learning module
export interface HistoryItem {
  role: "user" | "model";
  parts: { text: string }[];
}