// app/lib/hooks/supabaseServerActionClient.ts
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function getSupabaseServerActionClient() {
  const cookieStore = cookies();  
  return createServerActionClient({ cookies: () => cookieStore }); // this is actually correct, not an error
}
