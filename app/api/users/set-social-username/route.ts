import { NextResponse } from 'next/server'
import { supabase as supabaseAdmin } from '@/app/lib/hooks/supabaseAdminClient'
import { getSupabaseServerClient } from '@/app/lib/hooks/supabaseServerClient'

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { social_username } = await req.json()
    if (!social_username) {
      return NextResponse.json({ error: "Missing username" }, { status: 400 })
    }

    // Check if username is taken (safe with service role)
    const { data: existing } = await supabaseAdmin
      .from("Users")
      .select("user_id")
      .eq("social_username", social_username)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 })
    }

    // Update using service role to avoid RLS
    const { error } = await supabaseAdmin
      .from("Users")
      .update({ social_username })
      .eq("user_id", user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("set social username error:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
