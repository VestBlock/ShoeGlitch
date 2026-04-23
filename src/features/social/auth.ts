import { getSession } from '@/lib/session';

export async function isAuthorizedSocialRequest(request: Request) {
  const session = await getSession();
  if (session?.role === 'super_admin') return true;

  const secret = process.env.SOCIAL_CRON_SECRET;
  if (!secret) return false;

  const headerSecret =
    request.headers.get('x-social-secret') ??
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  return headerSecret === secret;
}
