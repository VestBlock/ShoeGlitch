import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

function safeSet(
  cookieStore: ReturnType<typeof cookies>,
  name: string,
  value: string,
  options: CookieOptions,
) {
  try {
    cookieStore.set({ name, value, ...options });
  } catch {
    // Server Components can't write cookies during render.
    // Middleware will refresh the session on the next request.
  }
}

export function createServerSupabaseClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          safeSet(cookieStore, name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          safeSet(cookieStore, name, '', { ...options, expires: new Date(0) });
        },
      },
    },
  );
}
