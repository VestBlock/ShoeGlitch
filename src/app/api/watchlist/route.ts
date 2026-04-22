import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { watchlistInputSchema } from '@/features/intelligence/watchlist/form';
import { getWatchlistDashboard } from '@/features/intelligence/watchlist/service';
import { watchlistStore } from '@/features/intelligence/watchlist/store';

function unauthorized() {
  return NextResponse.json({ error: 'Sign in to use your watchlist.' }, { status: 401 });
}

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();

  const dashboard = await getWatchlistDashboard(session.userId);
  return NextResponse.json(dashboard);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return unauthorized();

  const body = await request.json().catch(() => null);
  const parsed = watchlistInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
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

  return NextResponse.json({ item }, { status: 201 });
}
