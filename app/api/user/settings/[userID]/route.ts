// app/api/users/[userId]/route.ts
import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/app/lib/hooks/supabaseServerClient'

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const supabase = await getSupabaseServerClient()
    
    const { data: user, error } = await supabase
      .from('Users')
      .select('user_id, username, avatar_url')
      .eq('user_id', params.userId)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}