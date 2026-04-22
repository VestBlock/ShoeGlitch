import { NextResponse } from 'next/server';
import { recordGrowthLead } from '@/lib/growth/persistence';

export async function POST(request: Request) {
  const payload = await request.json();

  if (!payload?.email || !payload?.routePath || !payload?.offer) {
    return NextResponse.json(
      { message: 'email, routePath, and offer are required.' },
      { status: 400 },
    );
  }

  const result = await recordGrowthLead(payload);
  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Thanks — your request was received.' });
}
