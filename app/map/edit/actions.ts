"use server";

import { getSupabaseServerActionClient } from "@/app/lib/hooks/supabaseServerActionClient";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function getSelectedLanguageFor(userId: string) {
  const supa = await getSupabaseServerActionClient();
  const { data: st } = await supa
    .from("UserSettings")
    .select("language")
    .eq("user_id", userId)
    .maybeSingle();
  return st?.language?.trim() || null;
}

export async function createList(formData: FormData) {
  const supa = await getSupabaseServerActionClient();
  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user) redirect("/home");

  const name = (formData.get("name") as string)?.trim() || "New Oasis";
  const lang = await getSelectedLanguageFor(user.id);

  if (!lang) {
    redirect("/map/edit?flash=Set%20your%20language%20in%20Settings%20first&type=error");
  }

  const { data: inserted, error } = await supa
    .from("WordList")
    .insert([{ word_list_name: name, language: lang, user_id: user.id }])
    .select("word_list_id")
    .single();

  if (error || !inserted) {
    console.error("Create failed:", error?.message, error?.details ?? "");
    redirect("/map/edit?flash=Failed%20to%20create%20oasis&type=error");
  }

  redirect(`/oasis/${inserted.word_list_id}/edit`);
}

export async function deleteList(listId: string) {
  const supa = await getSupabaseServerActionClient();
  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user) redirect("/home");

  const { error } = await supa
    .from("WordList")
    .delete()
    .eq("word_list_id", listId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Delete failed:", error.message, error.details ?? "");
    redirect("/map/edit?flash=Delete%20failed&type=error");
  }

  revalidatePath("/map/edit");
  redirect("/map/edit?flash=Deleted&type=success");
}

/** form-friendly wrapper */
export async function deleteListAction(formData: FormData) {
  const id = String(formData.get("listId") || "");
  if (!id) return;
  await deleteList(id);
}

export async function createListAction(formData: FormData) {
  await createList(formData);
}
