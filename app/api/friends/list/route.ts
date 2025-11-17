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
    const type = searchParams.get('type') || 'accepted'

    let query = supabase
      .from('Friendships')
      .select(`
        *,
        requester:user_id ( user_id, social_username, avatar_url ),
        receiver:friend_id ( user_id, social_username, avatar_url )
      `)

    if (type === 'accepted') {
      // All accepted friendships either sent or received
      query = query
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq('status', 'accepted')

    } else if (type === 'pending') {
      // Requests received by me
      query = query
        .eq('friend_id', user.id)
        .eq('status', 'pending')

    } else if (type === 'sent') {
      // Requests I sent
      query = query
        .eq('user_id', user.id)
        .eq('status', 'pending')
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Normalize friendInfo
    const formatted = data.map((f) => {
      const isRequester = f.user_id === user.id
      const friendInfo = isRequester ? f.receiver : f.requester

      return {
        ...f,
        friendInfo: {
          user_id: friendInfo?.user_id,
          social_username: friendInfo?.social_username,
          avatar_url: friendInfo?.avatar_url
        }
      }
    })

    return NextResponse.json({ friends: formatted })
  } catch (error) {
    console.error('List friends error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
