// app/api/settings/route.ts
// This file handles user settings updates, such as language and difficulty preferences.
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/util/supabaseServer";

// Handles POST requests to update user settings.
export async function POST(req: NextRequest) {
  const supabase = getSupabaseServer();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { language, difficulty } = await req.json();

  const { error } = await supabase
    .from("user_settings")
    .upsert({ user_id: user.id, language, difficulty });

  if (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
