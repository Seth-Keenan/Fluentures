// app/api/activity/feed/route.ts
import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/app/lib/hooks/supabaseServerClient'

interface Activity {
  activity_id: string
  user_id: string
  activity_type: string
  activity_data: any
  created_at: string
}

interface User {
  user_id: string
  username: string
  avatar_url?: string
}

export async function GET(req: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get list of accepted friends
    const { data: friendships, error: friendshipsError } = await supabase
      .from('Friendships')
      .select('user_id, friend_id')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
      .eq('status', 'accepted')

    if (friendshipsError) {
      return NextResponse.json({ error: friendshipsError.message }, { status: 500 })
    }

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
        activity_id,
        user_id,
        activity_type,
        activity_data,
        created_at
      `)
      .in('user_id', friendIds)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Type assertion for activities
    const typedActivities = activities as Activity[]

    // Get user information for each activity
    const userIds = [...new Set(typedActivities.map(a => a.user_id))]
    const { data: users } = await supabase
      .from('Users')
      .select('user_id, username, avatar_url')
      .in('user_id', userIds)

    // Type assertion for users
    const typedUsers = users as User[]

    // Map user data to activities
    const activitiesWithUsers = typedActivities.map(activity => {
      const activityUser = typedUsers?.find(u => u.user_id === activity.user_id)
      return {
        ...activity,
        user: activityUser || { username: 'Unknown User', user_id: activity.user_id }
      }
    })

    return NextResponse.json({ activities: activitiesWithUsers })
  } catch (error) {
    console.error('Activity feed error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}