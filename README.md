# Fluentures 🐪
Oasis-themed language learning app by Team camelCase.

## Getting Started

These instructions will get your development environment set up and the app running locally.

### 1. Install Node.js

Make sure you have **Node.js (v18 or higher)** installed.

Download it from the official site:  
https://nodejs.org/

### 2. Verify node installed and clone the Repository

```bash
node -v

npm -v

git clone "insert HTTPS here"

cd Fluentures

npm install

npm run dev 
```
## Supabase Documentation
### Current Schema:
Make a request [here](https://docs.google.com/document/d/1ylrXERwUurzHS7x3toWjKsTz1sZfwd6-NzpLQVLlDm0/edit?usp=sharing) for additional tables.
![Schema](assets/schema.png)

## These below examples will help when interacting with Supabase on the SERVER-SIDE. You can look at the UserSettings page for an example doing this client side.
### 1. How the Supabase server client is made:
```typescript
// // app/lib/hooks/supabaseServerClient.ts
// // Call this exported function to create a server-side supabase client
// // This must be called in your server-side functions like this: 
// // const supabase = await getSupabaseServerClient()

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();  
  return createRouteHandlerClient({ cookies: () => cookieStore }); 
}
```
### 2. How to READ data:
```typescript
// app/api/test/getUserSettings/route.ts
// You can test this route logging in and going to /api/test/getUserSettings

import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/app/lib/hooks/supabaseServerClient'

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { data: settings, error: settingsError } = await supabase
      .from('UserSettings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (settingsError) return NextResponse.json({ error: settingsError.message }, { status: 500 })

    return NextResponse.json({ user, settings })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```
### 3. How to CREATE data: 
```typescript
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
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```
```typescript
// app/testing/createWordPage
// To test this comment your name out and visit this page once logged in
// To delete this word later save the WordID from the console

'use client'; 

import { useEffect } from 'react';

export default function CreateWordPage() {
  useEffect(() => {
    async function createWord() {
      
      const wordListID = '550e8400-e29b-41d4-a716-446655440000' // Seth E.
      // const wordListID = '550e8400-e29b-41d4-a716-446655440000' // Evie
      // const wordListID = '550e8400-e29b-41d4-a716-446655440000' // Ang
      // const wordListID = '550e8400-e29b-41d4-a716-446655440000' // Jay
      // const wordListID = '550e8400-e29b-41d4-a716-446655440000' // Kody
      // const wordListID = '550e8400-e29b-41d4-a716-446655440000' // Seth K.

      try {
        const response = await fetch('/api/test/createWord', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            word_list_id: wordListID, 
            word_target: 'こんにちは',
            word_english: 'Hello',
            note: 'Common greeting in Japanese',
            is_favorite: true,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          console.error('Error:', result.error);
        } else {
          console.log('Word created:', result.word);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      }
    }

    createWord();
  }, []);

  return (
    <div>
      <h1>Creating Word...</h1>
      <p>Check the console for results.</p>
    </div>
  );
}
```
### 4. How to UPDATE data:
```typescript
// You can already update your settings on the settings page so this is just an example

import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/app/lib/hooks/supabaseServerClient'

export async function PUT(req: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { language, difficulty, display } = await req.json()

    const { data, error } = await supabase
      .from('UserSettings')
      .update({ language, difficulty, display })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ message: 'Settings updated', settings: data })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```
### 5. How to DELETE data:
```typescript
// app/api/test/deleteWord/route.ts
// This is what it would look like to delete words
// Visit app/testing/deleteWordPage, enter your WordID, and check the console

import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/app/lib/hooks/supabaseServerClient'

export async function DELETE(req: Request) {
  try {
    const supabase = await getSupabaseServerClient()
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
```
## Examples for Server Actions
### 1. How the Supabase server action client is made
```typescript
// app/lib/hooks/supabaseServerActionClient.ts
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function getSupabaseServerActionClient() {
  const cookieStore = await cookies();  
  return createServerActionClient({ cookies: () => cookieStore }); // this is actually correct, not an error
}
```
```typescript
//app/lib/actions/wordlistAction.ts
// This is an example from this file how to work with server actions
"use server";

import { getSupabaseServerActionClient } from '@/app/lib/hooks/supabaseServerActionClient'
import type { WordItem } from "@/app/types/wordlist";


export async function createWordList(name: string, language?: string) {
  console.log('Creating word list:', { name, language });

  const supabase = await getSupabaseServerActionClient(); 
  console.log('Supabase client created');

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  console.log('Auth check result:', {
    userId: user?.id,
    hasUser: !!user,
    userError: userError?.message
  });

  if (userError || !user) {
    console.error('Authentication failed:', userError);
    return null;
  }

  const insertData = {
    word_list_name: name,  
    language: language ?? null,
    user_id: user.id,
    is_favorite: false
  };
  console.log('Attempting to insert:', insertData);

  const { data, error } = await supabase
    .from("WordList") 
    .insert(insertData)
    .select("word_list_id")
    .single();

  if (error) {
    console.error("createWordList insertion error:", error);
    return null;
  }

  console.log('Successfully created word list:', data);
  return data.word_list_id as string;
}
```

### If you have any questions ask me!
* If you want a read/create/update/delete route for a specific table, create a card or DM me
* I tested all of the above examples and they worked for me, so lmk if they don't work for you
* If you're having issues with cookies refer to these examples and see if your method is the same