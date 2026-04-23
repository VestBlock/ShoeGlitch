import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { findOrProvisionAppUserForAuth } from '@/lib/auth-provisioning';
import { sendCustomerWelcomeEmail } from '@/lib/email';
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

  const provisioned = await findOrProvisionAppUserForAuth({
    authUserId: data.user.id,
    email: data.user.email ?? '',
    name: data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? data.user.email ?? 'Shoe Glitch customer',
    defaultRole: 'customer',
  });

  if (provisioned.wasCreated && provisioned.user.role === 'customer' && data.user.email) {
    await sendCustomerWelcomeEmail({
      toEmail: data.user.email,
      name: provisioned.user.name,
    });
  }

  const role = (provisioned.user.role ?? 'customer') as Role;
  const destination = ROLE_HOME[role] ?? '/customer';

  return NextResponse.redirect(new URL(destination, request.url));
}
