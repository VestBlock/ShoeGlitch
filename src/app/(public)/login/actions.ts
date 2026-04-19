'use server';

import { redirect } from 'next/navigation';
import { signInWithDemoEmail, signOut, signInWithGoogle } from '@/lib/session';
import { ROLE_HOME } from '@/lib/rbac';

export async function loginAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const session = await signInWithDemoEmail(email);
  if (!session) {
    return { ok: false as const, error: 'Could not sign in. Check that the email matches a seeded demo user.' };
  }
  redirect(ROLE_HOME[session.role]);
}

export async function loginAsAction(email: string) {
  const session = await signInWithDemoEmail(email);
  if (!session) return;
  redirect(ROLE_HOME[session.role]);
}

export async function logoutAction() {
  await signOut();
  redirect('/');
}

export async function googleSignInAction() {
  const url = await signInWithGoogle();
  redirect(url);
}
