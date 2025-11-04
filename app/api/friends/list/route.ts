// app/api/friends/list/route.ts
import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/app/lib/hooks/supabaseServerClient'

export async function GET(req: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'accepted' // 'accepted', 'pending', 'sent'

    let query = supabase.from('Friendships').select(`
      *,
      user:user_id(email),
      friend:friend_id(email)
    `)

    if (type === 'accepted') {
      // Get accepted friends (both directions)
      query = query
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq('status', 'accepted')
    } else if (type === 'pending') {
      // Get pending requests received
      query = query
        .eq('friend_id', user.id)
        .eq('status', 'pending')
    } else if (type === 'sent') {
      // Get pending requests sent
      query = query
        .eq('user_id', user.id)
        .eq('status', 'pending')
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Format the response to show the friend's info
    const formatted = data.map(f => ({
      ...f,
      friendInfo: f.user_id === user.id ? f.friend : f.user
    }))

    return NextResponse.json({ friends: formatted })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}