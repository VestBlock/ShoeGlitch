'use server';

import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { ensureCustomerProfile, ensureOperatorAuthInvite } from '@/lib/auth-provisioning';
import {
  sendOperatorApplicationApproved,
  sendOperatorApplicationRejected,
} from '@/lib/email';
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
    await admin
      .from('users')
      .update({ role: 'cleaner' })
      .eq('id', existingUser.id);
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

  const customerId = await ensureCustomerProfile({
    userId,
    email: app.email,
    name: app.name,
  });

  const { data: existingCleaner } = await admin
    .from('cleaners')
    .select('id')
    .eq('userId', userId)
    .maybeSingle();

  if (!existingCleaner?.id) {
    const { error: cleanerError } = await admin
      .from('cleaners')
      .insert({
        userId,
        customerId,
        cityId: app.cityId,
        name: app.name,
        phone: app.phone,
        tier: app.tier,
        active: true,
      });

    if (cleanerError) throw cleanerError;
  } else {
    const { error: cleanerUpdateError } = await admin
      .from('cleaners')
      .update({
        cityId: app.cityId,
        name: app.name,
        phone: app.phone,
        tier: app.tier,
        active: true,
      })
      .eq('id', existingCleaner.id);

    if (cleanerUpdateError) throw cleanerUpdateError;
  }

  const { error: updateError } = await admin
    .from('operator_applications')
    .update({ status: 'approved' })
    .eq('id', applicationId);

  if (updateError) throw updateError;

  await ensureOperatorAuthInvite({
    appUserId: userId,
    email: app.email,
    name: app.name,
    role: 'cleaner',
  });

  try {
    const { data: city } = await admin
      .from('cities')
      .select('name')
      .eq('id', app.cityId)
      .maybeSingle();

    await sendOperatorApplicationApproved({
      applicationId: app.id,
      toEmail: app.email,
      name: app.name,
      cityName: city?.name ?? 'your city',
      tier: app.tier,
    });
  } catch (emailError) {
    console.error('[email] operator approval notification failed:', emailError);
  }
}

export async function rejectOperatorAction(applicationId: string) {
  await requireSuperAdmin();

  const admin = createAdminSupabaseClient();
  const { data: app } = await admin
    .from('operator_applications')
    .select('*')
    .eq('id', applicationId)
    .maybeSingle();

  if (!app) throw new Error('Application not found');
  if (app.status !== 'pending') throw new Error('Already processed');

  const { error } = await admin
    .from('operator_applications')
    .update({ status: 'rejected' })
    .eq('id', applicationId);

  if (error) throw error;

  try {
    const { data: city } = await admin
      .from('cities')
      .select('name')
      .eq('id', app.cityId)
      .maybeSingle();

    await sendOperatorApplicationRejected({
      applicationId: app.id,
      toEmail: app.email,
      name: app.name,
      cityName: city?.name ?? 'your city',
      tier: app.tier,
    });
  } catch (emailError) {
    console.error('[email] operator rejection notification failed:', emailError);
  }
}
