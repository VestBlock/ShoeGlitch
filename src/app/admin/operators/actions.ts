'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/session';

export async function approveOperatorAction(applicationId: string) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const supabase = createServerSupabaseClient();

  // Verify admin
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.userId)
    .maybeSingle();

  if (user?.role !== 'admin') throw new Error('Admin only');

  // Get application
  const { data: app } = await supabase
    .from('operator_applications')
    .select('*')
    .eq('id', applicationId)
    .maybeSingle();

  if (!app) throw new Error('Application not found');
  if (app.status !== 'pending') throw new Error('Already processed');
  if (app.kitPaymentStatus !== 'paid') throw new Error('Kit not paid');

  // Create user account if doesn't exist
  let userId = null;
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', app.email)
    .maybeSingle();

  if (existingUser) {
    userId = existingUser.id;
  } else {
    const { data: newUser, error: userError } = await supabase
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

  // Create customer record
  const { data: customer, error: custError } = await supabase
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

  // Create cleaner record
  const { error: cleanerError } = await supabase
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

  // Mark application approved
  const { error: updateError } = await supabase
    .from('operator_applications')
    .update({ status: 'approved' })
    .eq('id', applicationId);

  if (updateError) throw updateError;
}

export async function rejectOperatorAction(applicationId: string) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const supabase = createServerSupabaseClient();

  // Verify admin
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.userId)
    .maybeSingle();

  if (user?.role !== 'admin') throw new Error('Admin only');

  const { error } = await supabase
    .from('operator_applications')
    .update({ status: 'rejected' })
    .eq('id', applicationId);

  if (error) throw error;
}
