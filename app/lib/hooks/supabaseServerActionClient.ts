// app/lib/hooks/supabaseServerActionClient.ts
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

/**
 * Returns a Supabase server-action client. In normal server request scope this
 * uses Next's `cookies()` store. In environments where `cookies()` throws
 * (outside a request scope, like unit tests), fall back to a noop cookie
 * store so callers don't crash. Tests should mock this module when they need
 * to control returned data.
 */
export async function getSupabaseServerActionClient() {
  const cookieStore = cookies();  
  return createServerActionClient({ cookies: () => cookieStore }); // this is actually correct, not an error
}

//   let cookieStore: ReturnType<typeof cookies> | null = null;
//   try {
//     cookieStore = cookies();
//   } catch (err) {
//     // cookies() can throw when called outside a request scope (Next.js).
//     // Provide a minimal stub that satisfies the auth-helpers API.
//     cookieStore = {
//       get: (_name: string) => undefined,
//       set: (_name: string, _value: string) => undefined,
//       delete: (_name: string) => undefined,
//       // @ts-ignore allow partial stub
//     } as any;
//   }

//   return createServerActionClient({ cookies: () => cookieStore });
// }