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
      .select('user_id, social_username, avatar_url')
      .eq('user_id', params.userId)
      .maybeSingle()

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('GET /api/users/[userId] error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
