import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type { Role } from '@/types';

type ProvisionInput = {
  authUserId: string;
  email: string;
  name: string;
  defaultRole?: Role;
};

export async function ensureCustomerProfile(params: {
  userId: string;
  email: string;
  name: string;
}) {
  const admin = createAdminSupabaseClient();

  const { data: existing } = await admin
    .from('customers')
    .select('id')
    .eq('userId', params.userId)
    .maybeSingle();

  if (existing?.id) return existing.id;

  const { data, error } = await admin
    .from('customers')
    .insert({
      userId: params.userId,
      email: params.email,
      name: params.name,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id as string;
}

export async function findOrProvisionAppUserForAuth(params: ProvisionInput) {
  const admin = createAdminSupabaseClient();
  const fallbackRole = params.defaultRole ?? 'customer';

  const { data: byAuth } = await admin
    .from('users')
    .select('id, email, name, role, authUserId')
    .eq('authUserId', params.authUserId)
    .maybeSingle();

  if (byAuth?.id) {
    if ((byAuth.role as Role) === 'customer') {
      await ensureCustomerProfile({
        userId: byAuth.id,
        email: byAuth.email,
        name: byAuth.name,
      });
    }
    return { user: byAuth, wasCreated: false };
  }

  const { data: byEmail } = await admin
    .from('users')
    .select('id, email, name, role, authUserId')
    .eq('email', params.email)
    .maybeSingle();

  if (byEmail?.id) {
    if (!byEmail.authUserId) {
      await admin
        .from('users')
        .update({ authUserId: params.authUserId })
        .eq('id', byEmail.id);
    }

    if ((byEmail.role as Role) === 'customer') {
      await ensureCustomerProfile({
        userId: byEmail.id,
        email: byEmail.email,
        name: byEmail.name,
      });
    }

    return {
      user: {
        ...byEmail,
        authUserId: byEmail.authUserId ?? params.authUserId,
      },
      wasCreated: false,
    };
  }

  const { data: created, error } = await admin
    .from('users')
    .insert({
      email: params.email,
      name: params.name,
      role: fallbackRole,
      authUserId: params.authUserId,
    })
    .select('id, email, name, role, authUserId')
    .single();

  if (error) throw error;

  if (fallbackRole === 'customer') {
    await ensureCustomerProfile({
      userId: created.id,
      email: created.email,
      name: created.name,
    });
  }

  return { user: created, wasCreated: true };
}

export async function ensureOperatorAuthInvite(params: {
  appUserId: string;
  email: string;
  name: string;
  role: Extract<Role, 'cleaner' | 'city_manager'>;
}) {
  const admin = createAdminSupabaseClient();

  const { data: userRow } = await admin
    .from('users')
    .select('id, authUserId')
    .eq('id', params.appUserId)
    .maybeSingle();

  if (userRow?.authUserId) {
    return { authUserId: userRow.authUserId as string, invited: false };
  }

  const list = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (list.error) throw list.error;

  const existingAuthUser = list.data.users.find(
    (candidate) => candidate.email?.toLowerCase() === params.email.toLowerCase(),
  );

  if (existingAuthUser?.id) {
    await admin
      .from('users')
      .update({ authUserId: existingAuthUser.id })
      .eq('id', params.appUserId);
    return { authUserId: existingAuthUser.id, invited: false };
  }

  const invite = await admin.auth.admin.inviteUserByEmail(params.email, {
    data: {
      name: params.name,
      role: params.role,
    },
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://shoeglitch.com'}/auth/callback`,
  });

  if (invite.error) throw invite.error;

  const authUserId = invite.data.user?.id;
  if (authUserId) {
    await admin
      .from('users')
      .update({ authUserId })
      .eq('id', params.appUserId);
  }

  return { authUserId: authUserId ?? null, invited: true };
}
