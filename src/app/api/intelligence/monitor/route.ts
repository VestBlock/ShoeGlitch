import { NextResponse } from 'next/server';
import { getRetailMonitorSnapshot } from '@/features/intelligence/monitors/service';

export async function GET() {
  try {
    const snapshot = await getRetailMonitorSnapshot();
    return NextResponse.json(snapshot);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Retail monitor snapshot failed.' },
      { status: 500 },
    );
  }
}
