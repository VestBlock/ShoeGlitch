import { NextResponse } from 'next/server';
import { materializeGrowthPages } from '@/lib/growth/flywheel';

export async function POST(request: Request) {
  const authHeader = request.headers.get('x-growth-secret');
  if (!process.env.GROWTH_AUTOMATION_SECRET || authHeader !== process.env.GROWTH_AUTOMATION_SECRET) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const limit = typeof body.limit === 'number' ? body.limit : 10;
  const pages = await materializeGrowthPages(limit);

  return NextResponse.json({
    ok: true,
    generated: pages.length,
    pages,
  });
}
