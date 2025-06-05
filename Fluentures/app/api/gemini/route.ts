// app/api/gemini/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { action, input } = await req.json();

  if (action === 'generate') {
    return NextResponse.json({ story: `Once upon a time in ${input}...` });
  }

  if (action === 'chat') {
    return NextResponse.json({ reply: `Gemini says: ${input}` });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
