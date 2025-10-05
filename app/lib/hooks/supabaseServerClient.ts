// // app/lib/hooks/supabaseServerClient.ts
// // Call this exported function to create a server-side supabase client
// // This must be called in your server-side functions like this: 
// // const supabase = await getSupabaseServerClient()

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();  
  return createRouteHandlerClient({ cookies: () => cookieStore }); // this is actually correct, not an error
}
