// app/api/friends/send-request/route.ts
import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/app/lib/hooks/supabaseServerClient'

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { friend_username } = await req.json()

    // Lookup the user by social_username
    const { data: friendUser, error: friendError } = await supabase
      .from('Users')
      .select('user_id')
      .eq('social_username', friend_username)
      .single()

    if (friendError || !friendUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (friendUser.user_id === user.id) {
      return NextResponse.json({ error: 'Cannot friend yourself' }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from('Friendships')
      .select('*')
      .or(
        `and(user_id.eq.${user.id},friend_id.eq.${friendUser.user_id}),` +
        `and(user_id.eq.${friendUser.user_id},friend_id.eq.${user.id})`
      )
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Friendship already exists' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('Friendships')
      .insert([
        { user_id: user.id, friend_id: friendUser.user_id, status: 'pending' }
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Request sent', friendship: data })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}


// // app/api/friends/send-request/route.ts
// import { NextResponse } from 'next/server'
// import { getSupabaseServerClient } from '@/app/lib/hooks/supabaseServerClient'

// export async function POST(req: Request) {
//   try {
//     const supabase = await getSupabaseServerClient()
//     const { data: { user }, error: userError } = await supabase.auth.getUser()
    
//     if (userError || !user) {
//       return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
//     }

//     const { friend_email } = await req.json()

//     // Find the friend by email
//     const { data: friendUser, error: friendError } = await supabase
//       .from('UserSettings')
//       .select('user_id')
//       .eq('email', friend_email)
//       .single()

//     if (friendError || !friendUser) {
//       return NextResponse.json({ error: 'User not found' }, { status: 404 })
//     }

//     // Prevent self-friending
//     if (friendUser.user_id === user.id) {
//       return NextResponse.json({ error: 'Cannot send friend request to yourself' }, { status: 400 })
//     }

//     // Check if friendship already exists
//     const { data: existing } = await supabase
//       .from('Friendships')
//       .select('*')
//       .or(`and(user_id.eq.${user.id},friend_id.eq.${friendUser.user_id}),and(user_id.eq.${friendUser.user_id},friend_id.eq.${user.id})`)
//       .single()

//     if (existing) {
//       return NextResponse.json({ error: 'Friend request already exists' }, { status: 400 })
//     }

//     // Create friend request
//     const { data, error } = await supabase
//       .from('Friendships')
//       .insert([{
//         user_id: user.id,
//         friend_id: friendUser.user_id,
//         status: 'pending'
//       }])
//       .select()
//       .single()

//     if (error) {
//       return NextResponse.json({ error: error.message }, { status: 500 })
//     }

//     return NextResponse.json({ message: 'Friend request sent', friendship: data })
//   } catch (error) {
//     return NextResponse.json({ error: 'Server error' }, { status: 500 })
//   }
// }