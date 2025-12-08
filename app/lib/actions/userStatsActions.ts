"use server";

import { getSupabaseServerActionClient } from "@/app/lib/hooks/supabaseServerActionClient";
import dayjs from "dayjs";

export async function updateDailyStreak() {
  const supabase = await getSupabaseServerActionClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return;

  const userId = user.id;

  // 1. Fetch user row
  const { data: row } = await supabase
    .from("Users")
    .select("streak, last_active")
    .eq("user_id", userId)
    .maybeSingle
();

  const today = dayjs().startOf("day");
  const last = row?.last_active ? dayjs(row.last_active).startOf("day") : null;

  const prevStreak = row?.streak ?? 0;
  let newStreak = 1;

  if (last === null) {
    // first time or no recorded last_active -> start streak at 1
    newStreak = 1;
  } else {
    const diffDays = today.diff(last, "day");
    if (diffDays === 1) {
      // consecutive day
      newStreak = prevStreak + 1;
    } else if (diffDays > 1) {
      // missed a day
      newStreak = 1;
    } else {
      // same day or in the past (no change)
      newStreak = prevStreak || 1;
    }
  }

  // 3. Update DB
  const { error: updateError } = await supabase
    .from("Users")
    .update({
      streak: newStreak,
      last_active: new Date().toISOString()
    })
    .eq("user_id", userId);

  if (updateError) {
    console.error("Failed to update streak:", updateError);
    throw updateError;
  }

  return newStreak;
}

export async function addXP(amount: number) {
  const supabase = await getSupabaseServerActionClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return;
  const { data: row } = await supabase
    .from("Users")
    .select("xp")
    .eq("user_id", user.id)
    .maybeSingle
();

  if (!row) return;

  await supabase
    .from("Users")
    .update({ xp: row.xp + amount })
    .eq("user_id", user.id);
}

export async function addStudyTime(minutes: number) {
  const supabase = await getSupabaseServerActionClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return;

  // Read current value and update atomically from server-side
  const { data: row, error: fetchError } = await supabase
    .from("Users")
    .select("time_spent")
    .eq("user_id", user.id)
    .maybeSingle
();

  if (fetchError) {
    console.error("Failed to read time_spent:", fetchError);
    throw fetchError;
  }

  const current = Number(row?.time_spent ?? 0);
  const newTotal = current + Number(minutes || 0);

  const { error: updateError } = await supabase
    .from("Users")
    .update({ time_spent: newTotal })
    .eq("user_id", user.id);

  if (updateError) {
    console.error("Failed to update time_spent:", updateError);
    throw updateError;
  }
}
