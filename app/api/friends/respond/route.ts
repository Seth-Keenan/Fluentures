// app/api/friends/respond/route.ts
import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/app/lib/hooks/supabaseServerClient'

export async function PUT(req: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { friendship_id, action } = await req.json() // action: 'accept' or 'reject'

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Verify this request was sent to the current user
    const { data: friendship, error: fetchError } = await supabase
      .from('Friendships')
      .select('*')
      .eq('friendship_id', friendship_id)
      .eq('friend_id', user.id)
      .eq('status', 'pending')
      .single()

    if (fetchError || !friendship) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 })
    }

    const newStatus = action === 'accept' ? 'accepted' : 'rejected'

    const { data, error } = await supabase
      .from('Friendships')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('friendship_id', friendship_id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: `Friend request ${action}ed`, friendship: data })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}