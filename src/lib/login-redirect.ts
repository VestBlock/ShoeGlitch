export function sanitizeNextPath(nextPath: string | null | undefined): string | null {
  if (!nextPath) return null;
  if (!nextPath.startsWith('/')) return null;
  if (nextPath.startsWith('//')) return null;
  return nextPath;
}

export function buildLoginHref(nextPath?: string | null) {
  const safe = sanitizeNextPath(nextPath);
  return safe ? `/login?next=${encodeURIComponent(safe)}` : '/login';
}
