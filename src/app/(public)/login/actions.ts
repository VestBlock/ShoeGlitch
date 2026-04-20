'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { signInWithDemoEmail, signOut, signInWithGoogle } from '@/lib/session';
import { ROLE_HOME } from '@/lib/rbac';

function getSiteOrigin(): string {
  const h = headers();
  // Next.js sets x-forwarded-host and x-forwarded-proto on Vercel.
  const host =
    h.get('x-forwarded-host') ||
    h.get('host') ||
    'shoeglitch.com';
  const proto = h.get('x-forwarded-proto') || 'https';
  return `${proto}://${host}`;
}

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
  const origin = getSiteOrigin();
  const url = await signInWithGoogle(origin);
  redirect(url);
}
