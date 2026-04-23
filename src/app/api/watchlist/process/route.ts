import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { runMockWatchlistScan } from '@/features/intelligence/watchlist/service';

function isAuthorized(request: Request, sessionRole?: string | null) {
  if (sessionRole === 'super_admin') return true;
  const secret = process.env.WATCHLIST_CRON_SECRET;
  if (!secret) return false;
  return request.headers.get('x-watchlist-secret') === secret;
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!isAuthorized(request, session?.role)) {
    return NextResponse.json({ error: 'Not authorized to process watchlist alerts.' }, { status: 401 });
  }

  try {
    const result = await runMockWatchlistScan();
    return NextResponse.json(result);
  } catch (error) {
    console.error('[watchlist] process unavailable:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        error: 'Watchlist processing storage is not ready yet.',
        migration: 'supabase/migrations/20260422_watchlist_alerts.sql',
      },
      { status: 503 },
    );
  }
}
