export type WordItem = {
  id: string;
  target: string;
  english: string;
  notes?: string;
};

export type WordListFile = {
  items: WordItem[];
};
