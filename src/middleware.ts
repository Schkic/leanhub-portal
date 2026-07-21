import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return req.cookies.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({ name, value, ...options });
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: '', ...options });
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const { pathname } = req.nextUrl;

  const publicRoutes = ['/', '/prijava', '/registracija', '/auth/wall', '/auth/expired'];
  const isPublic = publicRoutes.some(r => pathname === r) || pathname.startsWith('/api/stripe');

  if (!session && !isPublic) {
    return NextResponse.redirect(new URL('/auth/wall', req.url));
  }

  if (session && !isPublic) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_pro, trial_ends_at')
      .eq('id', session.user.id)
      .single();

    const isPro = profile?.is_pro;
    const trialActive = profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date();

    if (!isPro && !trialActive && pathname !== '/auth/expired' && pathname !== '/profil') {
      return NextResponse.redirect(new URL('/auth/expired', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',],
};
