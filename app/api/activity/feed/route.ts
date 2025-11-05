// app/api/activity/feed/route.ts
import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/app/lib/hooks/supabaseServerClient'

export async function GET(req: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get list of friends
    const { data: friendships } = await supabase
      .from('Friendships')
      .select('user_id, friend_id')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
      .eq('status', 'accepted')

    if (!friendships || friendships.length === 0) {
      return NextResponse.json({ activities: [] })
    }

    // Extract friend IDs
    const friendIds = friendships.map(f => 
      f.user_id === user.id ? f.friend_id : f.user_id
    )

    // Get recent activities from friends
    const { data: activities, error } = await supabase
      .from('UserActivity')
      .select(`
        *,
        user:user_id(email)
      `)
      .in('user_id', friendIds)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ activities })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}