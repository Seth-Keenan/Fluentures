// This file protects routes with sessions? I hope lol

// auth-helpers is the old version for middleware
// TODO: update to supabase-ssr when possible

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This might not be the best way to do things
// If you have any opinions on this please lmk (Seth Ek)

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Exclude public pages and static files
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/about' ||
    pathname === '/signup' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico' ||
    pathname.match(/\.[^\/]+$/)
  ) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}
