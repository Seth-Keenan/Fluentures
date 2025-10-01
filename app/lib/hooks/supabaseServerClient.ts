// app/lib/hooks/supabaseServerClient.ts
// Call this exported function to create a server-side supabase client
// This must be called in your server-side functions like this: 
// const supabase = getSupabaseServerClient()

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export function getSupabaseServerClient() {
  const cookieStore = cookies()
  return createRouteHandlerClient({
    cookies: () => Promise.resolve(cookieStore)
  })
}
