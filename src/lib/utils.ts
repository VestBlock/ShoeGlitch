import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortId(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function orderCode(): string {
  const n = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  return `SG-${n}`;
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = {}) {
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      ...opts,
    });
  } catch {
    return iso;
  }
}

export function formatDateOnly(iso: string) {
  return formatDate(iso, { hour: undefined, minute: undefined });
}
