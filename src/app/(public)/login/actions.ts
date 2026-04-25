'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { signInWithDemoEmail, signOut, signInWithGoogle } from '@/lib/session';
import { ROLE_HOME } from '@/lib/rbac';
import { sanitizeNextPath } from '@/lib/login-redirect';

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
  const nextPath = sanitizeNextPath(String(formData.get('next') ?? '').trim());
  const session = await signInWithDemoEmail(email);
  if (!session) {
    redirect(nextPath ? `/login?error=signin_failed&next=${encodeURIComponent(nextPath)}` : '/login?error=signin_failed');
  }
  redirect(nextPath ?? ROLE_HOME[session.role]);
}

export async function loginAsAction(email: string, nextPath?: string | null) {
  const session = await signInWithDemoEmail(email);
  if (!session) return;
  redirect(sanitizeNextPath(nextPath) ?? ROLE_HOME[session.role]);
}

export async function logoutAction() {
  await signOut();
  redirect('/');
}

export async function googleSignInAction(formData: FormData) {
  const origin = getSiteOrigin();
  const nextPath = sanitizeNextPath(String(formData.get('next') ?? '').trim());
  const url = await signInWithGoogle(origin, nextPath ?? undefined);
  redirect(url);
}
