"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function getLogbookStats() {
  const supabase = createServerActionClient({ cookies });

  // 1) Get user
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const userId = user.id;

  // 2) All word lists owned by this user
  const { data: lists, error: listError } = await supabase
    .from("WordList")
    .select("word_list_id")
    .eq("user_id", userId);

  if (listError) console.error("Error fetching word lists:", listError);

  const listIds = lists?.map(l => l.word_list_id) ?? [];

  let wordsSaved = 0;

  if (listIds.length > 0) {
    // 3) Count all words inside those lists
    const { count, error: wordError } = await supabase
      .from("Word")
      .select("*", { count: "exact", head: true })
      .in("word_list_id", listIds);

    if (wordError) console.error("Error counting words:", wordError);
    wordsSaved = count ?? 0;
  }

  // 4) User XP + stats
  const { data: userRow } = await supabase
    .from("Users")
    .select("xp, time_spent, streak")
    .eq("user_id", userId)
    .single();

  return {
    wordsSaved,
    listsMade: listIds.length,
    xp: userRow?.xp ?? 0,
    minutes: userRow?.time_spent ?? 0,
    streakDays: userRow?.streak ?? 0
  };
}

export async function getRecentlyLearned(limit = 5) {
  const supabase = createServerActionClient({ cookies });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return [];

  const userId = user.id;

  // 1. Get all WordList IDs for this user
  const { data: lists } = await supabase
    .from("WordList")
    .select("word_list_id")
    .eq("user_id", userId);

  const listIds = lists?.map(l => l.word_list_id) ?? [];
  if (listIds.length === 0) return [];

  // 2. Get recent word entries
  const { data: words } = await supabase
    .from("Word")
    .select("word_id, word_target, word_english, note, created_at")
    .in("word_list_id", listIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  return words ?? [];
}
