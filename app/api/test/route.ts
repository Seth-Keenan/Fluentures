import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get the current user from the session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Fetch user settings
    const { data: userSettings, error: settingsError } = await supabase
      .from('UserSettings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (settingsError) {
      return NextResponse.json({ error: settingsError.message }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Auth successful',
      user: {
        id: user.id,
        email: user.email
      },
      settings: userSettings
    })

  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
