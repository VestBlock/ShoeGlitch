import { NextResponse } from 'next/server';
import { recordGrowthEvent } from '@/lib/growth/persistence';

export async function POST(request: Request) {
  const payload = await request.json();

  if (!payload?.routePath || !payload?.eventName) {
    return NextResponse.json(
      { message: 'routePath and eventName are required.' },
      { status: 400 },
    );
  }

  await recordGrowthEvent(payload);
  return NextResponse.json({ ok: true });
}
