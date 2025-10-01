// app/api/test/deleteWord/route.ts
// This is what it would look like to delete words
// Visit app/testing/deleteWordPage, enter your WordID, and check the console

import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/app/lib/hooks/supabaseServerClient'

export async function DELETE(req: Request) {
  try {
    const supabase = getSupabaseServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { word_id } = await req.json()

    const { data, error } = await supabase
      .from('Word')
      .delete()
      .eq('word_id', word_id)
      .select()
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ message: 'Word deleted', word: data[0] })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
