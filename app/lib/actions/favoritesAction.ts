// lib/actions/favoritesAction.ts
"use server";

import { getSupabaseServerActionClient } from "@/app/lib/hooks/supabaseServerActionClient";

const DEBUG_MODE = true; // flip to false when done debugging

export type FavoriteWord = {
  word_id: string;
  word_target: string | null;
  word_english: string | null;
  is_favorite: boolean | null;
  word_list_id: string;
};

// Read the user's current language (latest settings row)
async function getCurrentLanguageForUser(
  supabase: Awaited<ReturnType<typeof getSupabaseServerActionClient>>,
  user_id: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("UserSettings")
    .select("language")
    .eq("user_id", user_id)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[favorites] ⚠️ UserSettings error:", error);
    return null;
  }
  console.log("[favorites] ✅ UserSettings row:", data);
  return data?.language ?? null;
}

export async function getAllFavoritesForUser(): Promise<FavoriteWord[]> {
  const supabase = await getSupabaseServerActionClient();

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    console.error("[favorites] ⚠️ Auth error:", userErr);
    return DEBUG_MODE ? { step: "auth", error: userErr } : [];
  }
  console.log("[favorites] ✅ Auth user.id:", user.id);

  const language = await getCurrentLanguageForUser(supabase, user.id);
  if (!language) {
    console.warn("[favorites] ⚠️ No current language found.");
    return DEBUG_MODE ? { step: "language", language: null } : [];
  }

  // Primary: join Word -> WordList; filter by owner and WordList.language
  console.log("[favorites] 🔍 Join query (WordList.language filter)...");
  const { data: joined, error: joinErr } = await supabase
    .from("Word")
    .select(`
      word_id,
      word_target,
      word_english,
      is_favorite,
      word_list_id,
      WordList!inner(user_id, language)
    `)
    .eq("is_favorite", true)
    .eq("WordList.user_id", user.id)
    .eq("WordList.language", language);

  if (joinErr) {
    console.error("[favorites] ⚠️ Join error:", joinErr);
  } else {
    console.log("[favorites] ✅ Join result count:", joined?.length ?? 0);
  }

  if (!joinErr && joined && joined.length > 0) {
    return joined.map((w: any) => ({
      word_id: w.word_id,
      word_target: w.word_target,
      word_english: w.word_english,
      is_favorite: w.is_favorite,
      word_list_id: w.word_list_id,
    })) as FavoriteWord[];
  }

  // Fallback: lists by user+language, then words by those list ids
  console.log("[favorites] ⚙️ Fallback (lists by user+language, then words)...");
  const { data: lists, error: listErr } = await supabase
    .from("WordList")
    .select("word_list_id")
    .eq("user_id", user.id)
    .eq("language", language);

  if (listErr) console.error("[favorites] ⚠️ WordList error:", listErr);
  else console.log("[favorites] ✅ WordList count:", lists?.length ?? 0);

  if (!lists?.length) {
    return DEBUG_MODE ? { step: "lists", language, lists_count: 0 } : [];
  }

  const listIds = lists.map(l => l.word_list_id);
  console.log("[favorites] listIds:", listIds);

  const { data: words, error: wordErr } = await supabase
    .from("Word")
    .select("word_id, word_target, word_english, is_favorite, word_list_id")
    .eq("is_favorite", true)
    .in("word_list_id", listIds);

  if (wordErr) console.error("[favorites] ⚠️ Word query error:", wordErr);
  else console.log("[favorites] ✅ Word count:", words?.length ?? 0);

  if (DEBUG_MODE) {
    return {
      user_id: user.id,
      language,
      join_error: joinErr,
      list_error: listErr,
      word_error: wordErr,
      joined_count: joined?.length ?? 0,
      lists_count: lists?.length ?? 0,
      words_count: words?.length ?? 0,
      lists_preview: lists?.slice(0, 3),
      words_preview: words?.slice(0, 3),
    };
  }

  return (words ?? []) as FavoriteWord[];
}
