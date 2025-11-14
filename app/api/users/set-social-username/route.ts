import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/app/lib/hooks/supabaseServerClient'

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { social_username } = await req.json()

    if (!social_username)
      return NextResponse.json({ error: "Missing username" }, { status: 400 })

    // Check if taken
    const { data: existing } = await supabase
      .from("Users")
      .select("user_id")
      .eq("social_username", social_username)
      .maybeSingle()

    if (existing)
      return NextResponse.json({ error: "Username already taken" }, { status: 409 })

    // Update
    const { error } = await supabase
      .from("Users")
      .update({ social_username })
      .eq("user_id", user.id)

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("social username error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
