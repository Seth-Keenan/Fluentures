// app/api/test/createWord/route.ts
// This is what it would look like to create new words
// I made fake data for each of use to test this out

import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/app/lib/hooks/supabaseServerClient'

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { word_list_id, word_target, word_english, note, is_favorite } = await req.json()

    const { data, error } = await supabase
      .from('Word')
      .insert([{ word_list_id, word_target, word_english, note, is_favorite }])
      .select()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ message: 'Word created', word: data[0] })
  } catch (error) {
    return NextResponse.json({ error: 'Server error: ' + error }, { status: 500 })
  }
}
