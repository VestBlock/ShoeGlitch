import { NextResponse } from 'next/server';
import { compareSneaksProduct, getNikePublicProduct, getSneakerProduct } from '@/features/intelligence/provider-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const provider = searchParams.get('provider') ?? 'default';

  if (!id) {
    return NextResponse.json({ error: 'Provide id.' }, { status: 400 });
  }

  try {
    const result =
      provider === 'sneaks'
        ? await compareSneaksProduct(id)
        : provider === 'nike-public'
          ? await getNikePublicProduct(id)
          : await getSneakerProduct(id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Product lookup failed.' },
      { status: 500 },
    );
  }
}
