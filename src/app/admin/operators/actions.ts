'use server';

import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/session';

async function requireSuperAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'super_admin') {
    throw new Error('Admin only');
  }
  return session;
}

export async function approveOperatorAction(applicationId: string) {
  await requireSuperAdmin();

  const admin = createAdminSupabaseClient();

  const { data: app } = await admin
    .from('operator_applications')
    .select('*')
    .eq('id', applicationId)
    .maybeSingle();

  if (!app) throw new Error('Application not found');
  if (app.status !== 'pending') throw new Error('Already processed');
  if (app.kitPaymentStatus !== 'paid') throw new Error('Kit not paid');

  let userId = null;
  const { data: existingUser } = await admin
    .from('users')
    .select('id')
    .eq('email', app.email)
    .maybeSingle();

  if (existingUser) {
    userId = existingUser.id;
  } else {
    const { data: newUser, error: userError } = await admin
      .from('users')
      .insert({
        email: app.email,
        name: app.name,
        role: 'cleaner',
      })
      .select('id')
      .single();

    if (userError) throw userError;
    userId = newUser.id;
  }

  const { data: customer, error: custError } = await admin
    .from('customers')
    .insert({
      userId,
      email: app.email,
      name: app.name,
      phone: app.phone,
    })
    .select('id')
    .single();

  if (custError) throw custError;

  const { error: cleanerError } = await admin
    .from('cleaners')
    .insert({
      userId,
      customerId: customer.id,
      cityId: app.cityId,
      name: app.name,
      phone: app.phone,
      tier: app.tier,
      active: true,
    });

  if (cleanerError) throw cleanerError;

  const { error: updateError } = await admin
    .from('operator_applications')
    .update({ status: 'approved' })
    .eq('id', applicationId);

  if (updateError) throw updateError;
}

export async function rejectOperatorAction(applicationId: string) {
  await requireSuperAdmin();

  const admin = createAdminSupabaseClient();
  const { error } = await admin
    .from('operator_applications')
    .update({ status: 'rejected' })
    .eq('id', applicationId);

  if (error) throw error;
}
