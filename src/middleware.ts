import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Zaštićene rute: dashboard, povijest, profil i sami alati (ali ne /alati indeks
// ni /alati/vodici/* koji su javni vodiči). Isti popis kao ono što stranice već
// same provjeravaju kroz requireAuth() — ovo samo dodaje server-side zaštitu
// prije nego se stranica uopće isporuči.
const PROTECTED_PREFIXES = ['/dashboard', '/povijest', '/profil'];

function isProtectedPath(pathname: string) {
  const isToolPage = pathname.startsWith('/alati/') && !pathname.startsWith('/alati/vodici');
  const isPrefixed = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  return isToolPage || isPrefixed;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (isProtectedPath(request.nextUrl.pathname) && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/prijava';
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
