import { NextResponse } from 'next/server';
import { resolveCatalogForCity } from '@/services/catalog';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cityId = searchParams.get('cityId');
  if (!cityId) {
    const [cities, services] = await Promise.all([db.cities.active(), db.services.active()]);
    return NextResponse.json({ cities, services });
  }
  const catalog = await resolveCatalogForCity(cityId);
  return NextResponse.json(catalog);
}
