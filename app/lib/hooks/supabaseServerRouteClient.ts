// app/lib/hooks/supabaseServerRouteClient.ts
"use server";

import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function getSupabaseServerRouteClient() {
  const cookieStore = (await cookies()) as unknown as ReturnType<typeof cookies>;  // ← must await in Next.js now
  return createRouteHandlerClient({ cookies: () => cookieStore });
}

/* This is identical to supabaseServerActionClient.ts 
   but I thought the name was confusing so I made another one
   Can consolidate/rename later */