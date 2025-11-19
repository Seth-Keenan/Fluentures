export type AiSuggestion = {
  target: string;
  english: string;
  notes?: string;
  reason?: string; // This is used to recommend similar words
};

export type AiCorrection = {
  id?: string; 
  originalTarget: string;
  correctedTarget: string;
  english: string;
  explanation?: string;
};

export type AiWordlistResponse = {
  suggestions: AiSuggestion[];
  corrections: AiCorrection[];
};
