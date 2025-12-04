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

// "use server";

// import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";

// export async function getLogbookStats() {
//   const supabase = createServerActionClient({ cookies });

//   // Get current user
//   const {
//     data: { user },
//     error: userError
//   } = await supabase.auth.getUser();

//   if (userError || !user) return { error: "Not authenticated" };

//   const userId = user.id;

//   // ---- Words Saved ----
//   const { count: wordsSaved, error: wordsError } = await supabase
//     .from("Word")
//     .select("*", { count: "exact", head: true })
//     .eq("user_id", userId);

//   // ---- Lists Made ----
//   const { count: listsMade, error: listsError } = await supabase
//     .from("WordList")
//     .select("*", { count: "exact", head: true })
//     .eq("user_id", userId);

//   // ---- XP & time_studied (from Users table) ----
//   const { data: userRow, error: userRowError } = await supabase
//     .from("Users")
//     .select("xp, time_spent, streak")
//     .eq("user_id", userId)
//     .single();

//   return {
//     wordsSaved: wordsSaved ?? 0,
//     listsMade: listsMade ?? 0,
//     xp: userRow?.xp ?? 0,
//     minutes: userRow?.time_spent ?? 0,
//     streakDays: userRow?.streak ?? 0
//   };
// }
