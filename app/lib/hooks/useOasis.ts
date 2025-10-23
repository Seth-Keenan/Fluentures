// app/lib/hooks/useOasis.ts
"use client";

import { useEffect, useState } from "react";
import { useListId } from "./useListId";
import { getWordListMeta, getWordlist } from "@/app/lib/actions/wordlistAction";
import type { WordItem } from "@/app/types/wordlist";

// Accept either { id, name, language } or { word_list_id, word_list_name, language }
type OasisMetaRaw =
  | { id?: string; name?: string; language?: string | null }
  | { word_list_id?: string; word_list_name?: string; language?: string | null };

// Robust normalizer that doesn’t rely on TS union narrowing
function normalizeMeta(m: OasisMetaRaw | null): { id: string; name: string; language: string | null } | null {
  if (!m) return null;
  const anyMeta = m as Record<string, any>;
  return {
    id: anyMeta.word_list_id ?? anyMeta.id ?? "",
    name: anyMeta.word_list_name ?? anyMeta.name ?? "",
    language: (anyMeta.language ?? null) as string | null,
  };
}

// Normalize words coming back as either
// { id, target, english, notes }  OR  { word_id, target_word, english, notes }
function normalizeWords(rows: any[] | null): WordItem[] {
  if (!rows) return [];
  return rows.map((r) => ({
    id: String(r.word_id ?? r.id ?? (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`)),
    target: r.target_word ?? r.target ?? "",
    english: r.english ?? "",
    notes: r.notes ?? "",
  }));
}

export function useOasisData() {
  const listId = useListId(); // from /oasis/[listId]/...
  const [meta, setMeta] = useState<{ id: string; name: string; language: string | null } | null>(null);
  const [words, setWords] = useState<WordItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!listId) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      const [m, w] = await Promise.all([getWordListMeta(listId), getWordlist(listId)]);
      if (!cancelled) {
        setMeta(normalizeMeta(m as OasisMetaRaw | null));
        setWords(normalizeWords(w as any[]));
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [listId]);

  return { listId, meta, words, loading };
}
