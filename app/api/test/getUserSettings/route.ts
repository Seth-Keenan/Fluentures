// app/api/test/getUserSettings/route.ts
// You can test this route logging in and going to /api/test/getUserSettings
import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/app/lib/hooks/supabaseServerClient'

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: settings, error: settingsError } = await supabase
      .from('UserSettings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (settingsError) return NextResponse.json({ error: settingsError.message }, { status: 500 })

    return NextResponse.json({ user, settings })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
