// app/api/user/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("UserSettings")
      .select("language, difficulty, display")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });

    return NextResponse.json(
      data ?? { language: "Japanese", difficulty: "Beginner", display: false }
    );
  } catch (e) {
    console.error("GET /api/user/settings crashed:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const body = await req.json().catch(() => null);
    if (!body || typeof body.language !== "string" || typeof body.difficulty !== "string") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = {
      user_id: user.id,
      language: body.language,
      difficulty: body.difficulty,
      display: body.display ?? null
    };

    const { data, error: upsertErr } = await supabase
      .from("UserSettings")
      .upsert(payload, { onConflict: "user_id" })
      .select("language, difficulty, display") // <-- return the row we just saved
      .single();

    if (upsertErr) {
      console.error("upsert error:", upsertErr);
      return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error("POST /api/user/settings crashed:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
