// app/api/user/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies as nextCookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

function ensureEnv() {
  const ok =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!ok) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or ANON_KEY");
}

async function getCookieStore() {
  const c = nextCookies() as any;
  return typeof c?.then === "function" ? await c : c;
}

function createSupabase(cookieStore: Awaited<ReturnType<typeof getCookieStore>>) {
  return createServerClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options, maxAge: 0 });
      },
    },
  });
}

// GET: read settings
export async function GET() {
  try {
    ensureEnv();
    const cookieStore = await getCookieStore();
    const supabase = createSupabase(cookieStore);

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("user_settings")
      .select("language, difficulty, display")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("❌ fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch", details: error }, { status: 500 });
    }

    return NextResponse.json(
      data ?? { language: "Japanese", difficulty: "Beginner", display: false }
    );
  } catch (e: any) {
    console.error("❌ GET crashed:", e);
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}

// POST: save settings (update-or-insert)
export async function POST(req: NextRequest) {
  try {
    ensureEnv();

    const body = await req.json().catch(() => null);
    if (
      !body ||
      typeof body.language !== "string" ||
      typeof body.difficulty !== "string" ||
      (body.display !== undefined && typeof body.display !== "boolean")
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const cookieStore = await getCookieStore();
    const supabase = createSupabase(cookieStore);

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1) look for existing row
    const { data: existing, error: selErr } = await supabase
      .from("user_settings")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (selErr) {
      console.error("❌ select error:", selErr);
      return NextResponse.json({ error: "Select failed", details: selErr }, { status: 500 });
    }

    const payload = {
      user_id: user.id,
      language: body.language,
      difficulty: body.difficulty,
      display: body.display ?? null, // boolean or null
      updated_at: new Date().toISOString(),
    };

    // 2) update if exists, otherwise insert
    if (existing) {
      const { error: updErr } = await supabase
        .from("user_settings")
        .update(payload)
        .eq("user_id", user.id);

      if (updErr) {
        console.error("❌ update error:", updErr);
        return NextResponse.json({ error: "Update failed", details: updErr }, { status: 500 });
      }
    } else {
      const { error: insErr } = await supabase
        .from("user_settings")
        .insert(payload);

      if (insErr) {
        console.error("❌ insert error:", insErr);
        return NextResponse.json({ error: "Insert failed", details: insErr }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("❌ POST crashed:", e);
    return NextResponse.json({ error: e.message ?? "Internal error" }, { status: 500 });
  }
}
