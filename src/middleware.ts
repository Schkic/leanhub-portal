import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Javne rute — bez prijave
  const publicRoutes = [
    '/',
    '/prijava',
    '/registracija',
    '/auth/wall',
    '/auth/expired',
  ];

  const isPublic = publicRoutes.some(route => pathname === route || pathname.startsWith('/api/stripe'));

  // Nije prijavljen → wall stranica
  if (!session && !isPublic) {
    return NextResponse.redirect(new URL('/auth/wall', req.url));
  }

  // Prijavljen → provjeri trial/pro status
  if (session && !isPublic) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_pro, trial_ends_at')
      .eq('id', session.user.id)
      .single();

    const isPro = profile?.is_pro;
    const trialActive = profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date();

    // Ni PRO ni aktivan trial → expired stranica
    if (!isPro && !trialActive && pathname !== '/auth/expired' && pathname !== '/profil') {
      return NextResponse.redirect(new URL('/auth/expired', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
