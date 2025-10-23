// app/lib/actions/wordlistAction.ts
"use server";

import { getSupabaseServerActionClient } from "@/app/lib/hooks/supabaseServerActionClient";
import type { WordItem } from "@/app/types/wordlist";

export type WordListMeta = {
  id: string;
  name: string;
  language: string | null;
};

/**
 * READ: get metadata for a given listId
 */
export async function getWordListMeta(listId: string): Promise<WordListMeta | null> {
  if (!listId) return null;

  const supabase = await getSupabaseServerActionClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return null;

  const { data, error } = await supabase
    .from("WordList")
    .select("word_list_id, word_list_name, language")
    .eq("word_list_id", listId)
    .single();

  if (error) {
    console.error("getWordListMeta error:", error);
    return null;
  }

  // Map database columns to interface
  return {
    id: data.word_list_id,
    name: data.word_list_name,
    language: data.language,
  } as WordListMeta;
}

/**
 * UPDATE: update metadata (name, language) for a given listId
 */
export async function updateWordListMeta(
  listId: string,
  patch: Partial<Pick<WordListMeta, "name" | "language">>
): Promise<boolean> {
  if (!listId) return false;

  const supabase = await getSupabaseServerActionClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return false;

  // Map interface fields to database columns
  const dbPatch: Record<string, unknown> = {};
  if (patch.name !== undefined) dbPatch.word_list_name = patch.name;
  if (patch.language !== undefined) dbPatch.language = patch.language;

  const { error } = await supabase
    .from("WordList")
    .update(dbPatch)
    .eq("word_list_id", listId);

  if (error) {
    console.error("updateWordListMeta error:", error);
    return false;
  }
  return true;
}

/**
 * READ: load words for a given listId
 * Assumes table: Word(word_id uuid pk, word_list_id uuid fk, word_target text, word_english text, note text, is_favorite boolean)
 */
export async function getWordlist(listId: string): Promise<WordItem[]> {
  if (!listId) return [];

  const supabase = await getSupabaseServerActionClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return [];

  const { data, error } = await supabase
    .from("Word")
    .select("word_id, word_target, word_english, note")
    .eq("word_list_id", listId)
    .order("word_id", { ascending: true });

  if (error) {
    console.error("getWordlist error:", error);
    return [];
  }

  // Map database columns to interface
  return (data ?? []).map((w) => ({
    id: w.word_id as string,
    target: (w.word_target ?? "") as string,
    english: (w.word_english ?? "") as string,
    notes: (w.note ?? "") as string,
  }));
}

/**
 * RENAME the word list (only name can be changed for now)
 */
export async function renameWordList(listId: string, newName: string): Promise<boolean> {
  if (!listId) return false;
  const name = newName.trim();
  if (!name) return false;

  const supabase = await getSupabaseServerActionClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return false;

  const { error } = await supabase
    .from("WordList")
    .update({ word_list_name: name })
    .eq("word_list_id", listId);

  if (error) {
    console.error("renameWordList error:", error);
    return false;
  }
  return true;
}

/**
 * DELETE a word item from a list
 */
export async function deleteWordItem(listId: string, id: string) {
  const supabase = await getSupabaseServerActionClient();
  const { error } = await supabase
    .from("Word")
    .delete()
    .eq("word_id", id)
    .eq("word_list_id", listId);
  return !error;
}

/**
 * SAVE (minimal): upsert rows that are currently in the UI.
 */
export async function saveWordlist(listId: string, items: WordItem[]): Promise<boolean> {
  if (!listId) return false;

  const supabase = await getSupabaseServerActionClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return false;

  // Map interface fields to database columns
  const payload = items.map((i) => ({
    word_id: i.id,
    word_list_id: listId,
    word_target: i.target ?? "",
    word_english: i.english ?? "",
    note: i.notes ?? null,
  }));

  const { error } = await supabase.from("Word").upsert(payload, { onConflict: "word_id" });

  if (error) {
    console.error("saveWordlist (upsert) error:", error);
    return false;
  }
  return true;
}

/**
 * CREATE: create a new word list and return its id
 */
export async function createWordList(name: string, language?: string) {
  console.log("Creating word list:", { name, language });

  const supabase = await getSupabaseServerActionClient();
  console.log("Supabase client created");

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  console.log("Auth check result:", {
    userId: user?.id,
    hasUser: !!user,
    userError: userError?.message,
  });

  if (userError || !user) {
    console.error("Authentication failed:", userError);
    return null;
  }

  const insertData = {
    word_list_name: name,
    language: language ?? null,
    user_id: user.id,
    is_favorite: false,
  };
  console.log("Attempting to insert:", insertData);

  const { data, error } = await supabase
    .from("WordList")
    .insert(insertData)
    .select("word_list_id")
    .single();

  if (error) {
    console.error("createWordList insertion error:", error);
    return null;
  }

  console.log("Successfully created word list:", data);
  return data.word_list_id as string;
}
