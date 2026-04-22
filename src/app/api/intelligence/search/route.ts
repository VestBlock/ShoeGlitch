import { NextResponse } from 'next/server';
import { compareSneaksSearch, searchNikePublicSneakers, searchSneakers } from '@/features/intelligence/provider-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') ?? undefined;
  const sku = searchParams.get('sku') ?? undefined;
  const limit = Number(searchParams.get('limit') ?? '8');
  const provider = searchParams.get('provider') ?? 'default';

  if (!query && !sku) {
    return NextResponse.json({ error: 'Provide q or sku.' }, { status: 400 });
  }

  try {
    const result =
      provider === 'sneaks'
        ? await compareSneaksSearch({ query, sku, limit })
        : provider === 'nike-public'
          ? await searchNikePublicSneakers({ query, sku, limit })
        : await searchSneakers({ query, sku, limit });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed.' },
      { status: 500 },
    );
  }
}
