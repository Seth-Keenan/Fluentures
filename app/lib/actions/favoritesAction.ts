// lib/actions/favoritesAction.ts
"use server";

import { getSupabaseServerActionClient } from "@/app/lib/hooks/supabaseServerActionClient";

export type FavoriteWord = {
  word_id: string;
  word_target: string | null;
  word_english: string | null;
  is_favorite: boolean | null;
  word_list_id: string;
};

async function getCurrentLanguageForUser(
  supabase: Awaited<ReturnType<typeof getSupabaseServerActionClient>>,
  user_id: string
): Promise<string | null> {
  // Get the current language from UserSettings
  const { data: currentPref, error: currentErr } = await supabase
    .from("UserSettings")
    .select("language, is_current, updated_at")
    .eq("user_id", user_id)
    .order("is_current", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (currentErr) return null;
  return currentPref?.language ?? null;
}

export async function getAllFavoritesForUser(): Promise<FavoriteWord[]> {
  const supabase = await getSupabaseServerActionClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) return [];

  // 1) Get user's current language
  const language = await getCurrentLanguageForUser(supabase, user.id);
  if (!language) return [];

  // 2) Primary query (inner join Word → WordList → user_id)
  const { data: joined, error: joinErr } = await supabase
    .from("Word")
    .select(
      `
      word_id,
      word_target,
      word_english,
      is_favorite,
      word_list_id,
      WordList!inner(user_id)
    `
    )
    .eq("is_favorite", true)
    .eq("WordList.user_id", user.id)
    .eq("word_target", language)
    .order("updated_at", { ascending: false });

  if (!joinErr && joined) {
    return joined.map((w: any) => ({
      word_id: w.word_id,
      word_target: w.word_target,
      word_english: w.word_english,
      is_favorite: w.is_favorite,
      word_list_id: w.word_list_id,
    }));
  }

  // 3) Fallback: if no foreign key join
  const { data: lists, error: listErr } = await supabase
    .from("WordList")
    .select("word_list_id")
    .eq("user_id", user.id);

  if (listErr || !lists?.length) return [];

  const listIds = lists.map((l) => l.word_list_id);

  const { data: words, error: wordErr } = await supabase
    .from("Word")
    .select("word_id, word_target, word_english, is_favorite, word_list_id")
    .eq("is_favorite", true)
    .in("word_list_id", listIds)
    .eq("word_target", language)
    .order("updated_at", { ascending: false });

    console.log("[favorites] user.id =", user?.id);
console.log("[favorites] language =", language);

  if (wordErr || !words) return [];
  return words as FavoriteWord[];
}
