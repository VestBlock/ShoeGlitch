import { NextResponse } from 'next/server';
import { answerGrowthQuestion } from '@/lib/growth/rag';

export async function POST(request: Request) {
  const payload = await request.json();
  const query = String(payload?.query ?? '').trim();
  const routePath = String(payload?.routePath ?? '').trim();

  if (!query) {
    return NextResponse.json({ message: 'query is required.' }, { status: 400 });
  }

  const result = await answerGrowthQuestion(query, routePath);
  return NextResponse.json(result);
}
