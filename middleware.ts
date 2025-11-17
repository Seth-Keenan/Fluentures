// This file protects routes with sessions? I hope lol

// auth-helpers is the old version for middleware
// TODO: update to supabase-ssr when possible

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { supabase as admin } from '@/app/lib/hooks/supabaseAdminClient' // SERVICE ROLE client

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Exclude public pages and static files
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/about' ||
    pathname === '/signup' ||
    pathname === '/services' ||
    pathname === '/contacts' ||
    pathname === '/reset-password' ||
    pathname === '/update-password' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico' ||
    pathname.match(/\.[^\/]+$/)
  ) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // 1. Get session
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }

  // ⭐ FIXED: REQUIRE social_username for /social
  if (pathname.startsWith('/social')) {
    const userId = session.user.id;

    // Use SERVICE ROLE client to bypass RLS
    const { data: userRecord } = await admin
      .from('Users')
      .select('social_username')
      .eq('user_id', userId)
      .maybeSingle();

    const missingUsername = !userRecord?.social_username;
    const isOnRegistrationPage = pathname.startsWith('/social/register-username');

    if (missingUsername && !isOnRegistrationPage) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/social/register-username';
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}
