import { NextResponse } from 'next/server';
import { checkCoverage } from '@/lib/coverage';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const zip = searchParams.get('zip') ?? '';
  const result = await checkCoverage(zip);
  return NextResponse.json(result);
}
