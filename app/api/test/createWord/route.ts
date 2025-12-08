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
    // Award a small XP bump for adding a word (test route)
    try {
      const { data: userRow } = await supabase.from('Users').select('xp').eq('user_id', user.id).maybeSingle();
      const current = (userRow?.xp as number) || 0;
      const next = current + 3;
      await supabase.from('Users').update({ xp: next }).eq('user_id', user.id);
    } catch (err) {
      console.error('Failed to award XP for test createWord:', err);
    }

    return NextResponse.json({ message: 'Word created', word: data[0] })
  } catch (error) {
    return NextResponse.json({ error: 'Server error: ' + error }, { status: 500 })
  }
}
