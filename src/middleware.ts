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

function redirectUrl(request: NextRequest, pathname: string) {
  const host =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    request.nextUrl.host;
  const proto =
    request.headers.get('x-forwarded-proto') ||
    request.nextUrl.protocol.replace(':', '') ||
    'http';

  return new URL(`${proto}://${host}${pathname}`);
}

async function lookupRole(
  supabase: ReturnType<typeof createServerClient>,
  user: { id: string; email?: string | null },
): Promise<RoleKey | undefined> {
  const { data: byAuthId } = await supabase
    .from('users')
    .select('role')
    .eq('authUserId', user.id)
    .maybeSingle();

  const authRole = byAuthId?.role as RoleKey | undefined;
  if (authRole && ROLE_HOME[authRole]) return authRole;
  if (!user.email) return undefined;

  const { data: byEmail } = await supabase
    .from('users')
    .select('role')
    .eq('email', user.email)
    .maybeSingle();

  const emailRole = byEmail?.role as RoleKey | undefined;
  return emailRole && ROLE_HOME[emailRole] ? emailRole : undefined;
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (pathname === '/login' && user?.id) {
    const role = await lookupRole(supabase, user);
    if (role) {
      return NextResponse.redirect(redirectUrl(request, ROLE_HOME[role]));
    }
    return response;
  }

  const required = requiredRoleForPath(pathname);
  if (!required) return response;

  if (!user?.id) {
    return NextResponse.redirect(redirectUrl(request, '/login'));
  }

  const role = await lookupRole(supabase, user);

  if (!role || role !== required) {
    const target = role && ROLE_HOME[role] ? ROLE_HOME[role] : '/login';
    return NextResponse.redirect(redirectUrl(request, target));
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
