import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { ROLE_HOME } from '@/lib/rbac';
import type { Role } from '@/types';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user?.id) {
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }

  // Look up this user's role so we can send them to the right dashboard.
  // Uses admin client so this works regardless of RLS policies.
  const admin = createAdminSupabaseClient();
  const { data: userRow } = await admin
    .from('users')
    .select('role')
    .eq('authUserId', data.user.id)
    .maybeSingle();

  const role = (userRow?.role ?? 'customer') as Role;
  const destination = ROLE_HOME[role] ?? '/customer';

  return NextResponse.redirect(new URL(destination, request.url));
}
