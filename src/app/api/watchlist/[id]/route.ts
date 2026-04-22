import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { watchlistInputSchema } from '@/features/intelligence/watchlist/form';
import { watchlistStore } from '@/features/intelligence/watchlist/store';

function unauthorized() {
  return NextResponse.json({ error: 'Sign in to manage your watchlist.' }, { status: 401 });
}

async function loadOwnedItem(id: string, userId: string) {
  const item = await watchlistStore.byId(id);
  if (!item || item.userId !== userId) return null;
  return item;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return unauthorized();

  const existing = await loadOwnedItem(params.id, session.userId);
  if (!existing) {
    return NextResponse.json({ error: 'Watchlist item not found.' }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = watchlistInputSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const item = await watchlistStore.update(existing.id, {
    brand: parsed.data.brand,
    model: parsed.data.model,
    name: parsed.data.name,
    colorway: parsed.data.colorway,
    sku: parsed.data.sku,
    size: parsed.data.size,
    targetPrice: parsed.data.targetPrice,
    alertType: parsed.data.alertType,
    isActive: parsed.data.isActive,
  });

  return NextResponse.json({ item });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return unauthorized();

  const existing = await loadOwnedItem(params.id, session.userId);
  if (!existing) {
    return NextResponse.json({ error: 'Watchlist item not found.' }, { status: 404 });
  }

  await watchlistStore.remove(existing.id);
  return NextResponse.json({ ok: true });
}
