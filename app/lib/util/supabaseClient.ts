// lib/supabaseClient.ts
// (createPagesBrowserClient) is for React components, see supabaseServer.ts for api routes
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

export const supabase = createPagesBrowserClient(); 
