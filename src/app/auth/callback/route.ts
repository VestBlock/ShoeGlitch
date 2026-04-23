import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { findOrProvisionAppUserForAuth } from '@/lib/auth-provisioning';
import { sendAdminSystemAlert, sendCustomerWelcomeEmail } from '@/lib/email';
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
    await Promise.all([
      sendCustomerWelcomeEmail({
        toEmail: data.user.email,
        name: provisioned.user.name,
      }),
      sendAdminSystemAlert({
        subject: 'New customer signup',
        badge: 'Signup alert',
        heading: 'A new customer account was created.',
        body: `
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Name</td><td style="padding:8px 0;text-align:right;font-weight:600;">${provisioned.user.name}</td></tr>
            <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Email</td><td style="padding:8px 0;text-align:right;font-weight:600;">${data.user.email}</td></tr>
            <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Role</td><td style="padding:8px 0;text-align:right;font-weight:600;">customer</td></tr>
          </table>
        `,
        cta: { href: 'https://shoeglitch.com/admin/analytics', label: 'Open admin analytics →' },
      }),
    ]);
  }

  const role = (provisioned.user.role ?? 'customer') as Role;
  const destination = ROLE_HOME[role] ?? '/customer';

  return NextResponse.redirect(new URL(destination, request.url));
}
