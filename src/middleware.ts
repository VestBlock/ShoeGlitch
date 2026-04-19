import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

const ROLE_HOME = {
  customer: '/customer',
  cleaner: '/cleaner',
  city_manager: '/city-manager',
  super_admin: '/admin',
} as const;

type RoleKey = keyof typeof ROLE_HOME;

function startsWith(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function requiredRoleForPath(pathname: string): RoleKey | null {
  if (startsWith(pathname, '/admin')) return 'super_admin';
  if (startsWith(pathname, '/city-manager')) return 'city_manager';
  if (startsWith(pathname, '/cleaner')) return 'cleaner';
  if (startsWith(pathname, '/customer')) return 'customer';
  return null;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    },
  );

  // Validate + refresh session. Use getUser, NOT getSession, for security.
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // If already signed in and visiting /login, bounce to role home
  if (pathname === '/login' && user?.email) {
    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('email', user.email)
      .maybeSingle();
    const role = data?.role as RoleKey | undefined;
    if (role && ROLE_HOME[role]) {
      return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
    }
    return response;
  }

  const required = requiredRoleForPath(pathname);
  if (!required) return response;

  if (!user?.email) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('email', user.email)
    .maybeSingle();
  const role = data?.role as RoleKey | undefined;

  if (!role || role !== required) {
    // Wrong role → send them to their own home (or /login if unknown)
    const target = role && ROLE_HOME[role] ? ROLE_HOME[role] : '/login';
    return NextResponse.redirect(new URL(target, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/city-manager/:path*',
    '/cleaner/:path*',
    '/customer/:path*',
    '/login',
  ],
};
