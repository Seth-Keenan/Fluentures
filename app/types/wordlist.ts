// app/types/wordlist.ts

// One row shown/edited in UI table
export type WordItem = {
  id: string;            // matches words.id (string in TS. Its a uuid in db)
  target: string;
  english: string;
  notes?: string | null;
};

// The parent wordlist (an “oasis”)
export type WordListRow = {
  id: string;            // word_lists.id
  name: string;
  language: string | null;
};

// Separate type for creating a new list:
export type NewWordList = {
  name: string;
  language?: string | null;
};

// Strict shape for DB ↔ UI mapping:
export type DbWordRow = {
  id: string;
  word_list_id: string;
  target: string | null;
  english: string | null;
  notes: string | null;
};

export type WordListFile = {
  items: WordItem[];
};