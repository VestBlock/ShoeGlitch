import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { watchlistInputSchema } from '@/features/intelligence/watchlist/form';
import { getWatchlistDashboard } from '@/features/intelligence/watchlist/service';
import { watchlistStore } from '@/features/intelligence/watchlist/store';
import { recordGrowthEvent } from '@/lib/growth/persistence';

function unauthorized() {
  return NextResponse.json({ error: 'Sign in to use your watchlist.' }, { status: 401 });
}

function unavailable(error: unknown) {
  console.error('[watchlist] API unavailable:', error instanceof Error ? error.message : error);
  return NextResponse.json(
    {
      error: 'Watchlist storage is not ready yet.',
      migration: 'supabase/migrations/20260422_watchlist_alerts.sql',
    },
    { status: 503 },
  );
}

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();

  try {
    const dashboard = await getWatchlistDashboard(session.userId);
    return NextResponse.json(dashboard);
  } catch (error) {
    return unavailable(error);
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = watchlistInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const existingItems = await watchlistStore.listByUser(session.userId);
    const existing = existingItems.find((item) => {
      const sameSku = item.sku && parsed.data.sku && item.sku.toLowerCase() === parsed.data.sku.toLowerCase();
      const sameShape =
        item.brand.toLowerCase() === parsed.data.brand.toLowerCase()
        && item.model.toLowerCase() === parsed.data.model.toLowerCase()
        && (item.colorway ?? '').toLowerCase() === (parsed.data.colorway ?? '').toLowerCase();

      return Boolean(sameSku || sameShape);
    });

    if (existing) {
      return NextResponse.json({ item: existing, existing: true }, { status: 200 });
    }

    const item = await watchlistStore.create({
      userId: session.userId,
      brand: parsed.data.brand,
      model: parsed.data.model,
      name: parsed.data.name ?? null,
      colorway: parsed.data.colorway ?? null,
      sku: parsed.data.sku ?? null,
      size: parsed.data.size ?? null,
      targetPrice: parsed.data.targetPrice ?? null,
      alertType: parsed.data.alertType,
      isActive: parsed.data.isActive ?? true,
    });

    await recordGrowthEvent({
      routePath: '/customer/watchlist',
      eventName: 'watchlist_save',
      metadata: {
        watchlistItemId: item.id,
        alertType: item.alertType,
        brand: item.brand,
        model: item.model,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return unavailable(error);
  }
}
