//app/lib/actions/wordlistAction.ts
"use server";

import { getSupabaseServerActionClient } from '@/app/lib/hooks/supabaseServerActionClient'
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

  // Added this 3-line block
  const supabase = await getSupabaseServerActionClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return null;

  const { data, error } = await supabase
    .from("WordList") 
    .select("id, name, language")
    .eq("id", listId)
    .single();

  if (error) {
    console.error("getWordListMeta error:", error);
    return null;
  }
  return data as WordListMeta;
}

/**
 * UPDATE: update metadata (name, language) for a given listId
 */
export async function updateWordListMeta(
  listId: string,
  patch: Partial<Pick<WordListMeta, "name" | "language">>
): Promise<boolean> {
  if (!listId) return false;

  // const supabase = createServerActionClient({ cookies });

  // Added this 3-line block
  const supabase = await getSupabaseServerActionClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return false;

  const { error } = await supabase.from("WordList") .update(patch).eq("id", listId);
  if (error) { console.error("updateWordListMeta error:", error); return false; }
  return true;
}

/**
 * READ: load words for a given listId
 * Assumes table: words(id uuid pk, word_list_id uuid fk, target text, english text, notes text, created_at timestamptz)
 */
export async function getWordlist(listId: string): Promise<WordItem[]> {
  if (!listId) return [];

  // const supabase = createServerActionClient({ cookies });
  // Added this 3-line block
  const supabase = await getSupabaseServerActionClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return [];

  const { data, error } = await supabase
    .from("words")
    .select("id, target, english, notes")
    .eq("word_list_id", listId)
    .order("id", { ascending: true });

  if (error) {
    console.error("getWordlist error:", error);
    return [];
  }

  // map nulls -> ""
  return (data ?? []).map((w) => ({
    id: w.id as string,
    target: (w.target ?? "") as string,
    english: (w.english ?? "") as string,
    notes: (w.notes ?? "") as string,
  }));
}

/**
 * RENAME the word list (only name can be changed for now)
 */
export async function renameWordList(listId: string, newName: string): Promise<boolean> {
  if (!listId) return false;
  const name = newName.trim();
  if (!name) return false;

  // const supabase = createServerActionClient({ cookies });

  // Added this 3-line block
  const supabase = await getSupabaseServerActionClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return false;

  const { error } = await supabase
    .from("WordList") 
    .update({ name })
    .eq("id", listId)
    .select("id, name, language")
    .single();

  if (error) {
    console.error("renameWordList error:", error);
    return false;
  }
  return true;
}

/**
 * SAVE (minimal): upsert rows that are currently in the UI.
 * This version does NOT delete removed rows yet (we’ll add that next).
 */
export async function saveWordlist(listId: string, items: WordItem[]): Promise<boolean> {
  if (!listId) return false;

  // const supabase = createServerActionClient({ cookies });

  // Added this 3-line block
  const supabase = await getSupabaseServerActionClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return false;

  const payload = items.map((i) => ({
    id: i.id,                     // keep your client-generated id
    word_list_id: listId,
    target: i.target ?? "",
    english: i.english ?? "",
    notes: i.notes ?? null,
  }));

  const { error } = await supabase
    .from("words")
    .upsert(payload, { onConflict: "id" }); // upsert by PK

  if (error) {
    console.error("saveWordlist (upsert) error:", error);
    return false;
  }
  return true;
}

/**
 * CREATE (needs revision): create a new word list and return its id
 */
export async function createWordList(name: string, language?: string) {
  console.log('Creating word list:', { name, language });

  const supabase = await getSupabaseServerActionClient(); 
  console.log('Supabase client created');

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  console.log('Auth check result:', {
    userId: user?.id,
    hasUser: !!user,
    userError: userError?.message
  });

  if (userError || !user) {
    console.error('Authentication failed:', userError);
    return null;
  }

  const insertData = {
    word_list_name: name,  
    language: language ?? null,
    user_id: user.id,
    is_favorite: false
  };
  console.log('Attempting to insert:', insertData);

  const { data, error } = await supabase
    .from("WordList") 
    .insert(insertData)
    .select("word_list_id")
    .single();

  if (error) {
    console.error("createWordList insertion error:", error);
    return null;
  }

  console.log('Successfully created word list:', data);
  return data.word_list_id as string;
}
