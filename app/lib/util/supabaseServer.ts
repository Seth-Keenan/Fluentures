// lib/supabaseServer.ts
/* To be used for normal user actions.
The server client (createServerActionClient) is the secure way to:

Access the DB in API routes

Use the user session from cookies

Enforce Row Level Security policies automatically
*/
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export function getSupabaseServer() {
  return createServerActionClient({ cookies });
}
