import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/app/lib/hooks/supabaseServerClient";

type Body = { delta: number };

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    if (!body || typeof body.delta !== "number") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // read current xp (may be null)
    const { data: row, error: fetchError } = await supabase
      .from("Users")
      .select("xp")
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError) {
      console.error("xp fetch error:", fetchError);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    const current = (row?.xp as number) || 0;
    const next = current + Math.max(0, Math.floor(body.delta));

    const { error: updateError } = await supabase
      .from("Users")
      .update({ xp: next })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("xp update error:", updateError);
      return NextResponse.json({ error: "Failed to update xp" }, { status: 500 });
    }

    return NextResponse.json({ xp: next });
  } catch (err) {
    console.error("/api/xp/add error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
