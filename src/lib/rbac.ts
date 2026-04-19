// ==========================================================================
// RBAC
// Every server action / route handler calls requireRole() or requireAuth().
// Queries are further scoped: a city_manager's `orders.byCity()` uses their cityId.
// ==========================================================================

import type { Role, Session } from '@/types';

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export function requireAuth(session: Session | null): Session {
  if (!session) throw new AuthError('You must be signed in.');
  return session;
}

export function requireRole(session: Session | null, ...roles: Role[]): Session {
  const s = requireAuth(session);
  if (!roles.includes(s.role)) {
    throw new AuthError(`This area is restricted to: ${roles.join(', ')}.`);
  }
  return s;
}

/** Is this session allowed to view / mutate this city's data? */
export function canAccessCity(session: Session, cityId: string): boolean {
  if (session.role === 'super_admin') return true;
  if (session.role === 'city_manager') return session.cityId === cityId;
  if (session.role === 'cleaner') return session.cityId === cityId;
  if (session.role === 'customer') return true; // customers can place orders in any live city
  return false;
}

export const ROLE_HOME: Record<Role, string> = {
  customer: '/customer',
  cleaner: '/cleaner',
  city_manager: '/city-manager',
  super_admin: '/admin',
};
