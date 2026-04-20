// ==========================================================================
// SESSION
// Backed by Supabase Auth.
// getSession() reads the Supabase-authenticated user, then looks up the
// app's Session shape (role, cityId) from the users + cleaners/city_managers
// tables using admin() so it works regardless of RLS.
// ==========================================================================

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type { Session, Role } from '@/types';

/**
 * Returns the current app Session, or null if unauthenticated.
 * Called from Server Components, Server Actions, and Route Handlers.
 */
export async function getSession(): Promise<Session | null> {
  const supabase = createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user?.id) return null;

  const admin = createAdminSupabaseClient();

  // Link via authUserId (the auth.users UUID), not email.
  // This is stable across email changes and matches the schema's FK link.
  const { data: userRow } = await admin
    .from('users')
    .select('id, email, name, role')
    .eq('authUserId', user.id)
    .maybeSingle();

  if (!userRow) return null;

  let cityId: string | undefined;
  if (userRow.role === 'cleaner') {
    const { data } = await admin
      .from('cleaners')
      .select('cityId')
      .eq('userId', userRow.id)
      .maybeSingle();
    cityId = data?.cityId ?? undefined;
  } else if (userRow.role === 'city_manager') {
    const { data } = await admin
      .from('city_managers')
      .select('cityId')
      .eq('userId', userRow.id)
      .maybeSingle();
    cityId = data?.cityId ?? undefined;
  }

  return {
    userId: userRow.id,
    email: userRow.email,
    name: userRow.name,
    role: userRow.role as Role,
    cityId,
  };
}

/** Sign out via Supabase Auth. */
export async function signOut(): Promise<void> {
  const supabase = createServerSupabaseClient();
  await supabase.auth.signOut();
}

/**
 * Demo-mode instant login: signs the user in with password.
 * Requires seeded auth users with password "shoeglitch-demo".
 * This lets the demo role-switch buttons keep working.
 */
export async function signInWithDemoEmail(email: string): Promise<Session | null> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: 'shoeglitch-demo',
  });
  if (error) return null;
  return getSession();
}

/** Magic-link sign-in for real users. */
export async function signInWithMagicLink(
  email: string,
  origin: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signInWithGoogle(origin: string): Promise<string> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });
  if (error) throw error;
  if (!data.url) throw new Error('No OAuth URL returned from Supabase');
  return data.url;
}
