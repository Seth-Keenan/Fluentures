"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerActionClient } from "@/app/lib/hooks/supabaseServerActionClient";

export async function createOasis(formData: FormData) {
  const name = (formData.get("name") as string | null) ?? "New Oasis";

  const supabase = await getSupabaseServerActionClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("createOasis: auth error", userError?.message);
    redirect("/home");
  }

  const { data, error } = await supabase
    .from("WordList")
    .insert({
      user_id: user.id,
      word_list_name: name,
    })
    .select("word_list_id")
    .single();

  if (error || !data) {
    console.error("createOasis: failed to insert", error);
    redirect("/map");
  }

  // Go straight to edit the new oasis
  redirect(`/oasis/${data.word_list_id}/edit`);
}