import { NextResponse } from 'next/server';
import { WealthService } from '@/lib/services/WealthService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const count = parseInt(searchParams.get('count') || '6');
  const market = searchParams.get('market') as 'egypt' | 'uae' | undefined;

  try {
    const portfolio = await WealthService.getCuratedPortfolio(count, market);
    return NextResponse.json(portfolio);
  } catch (error: unknown) {
    console.error('[Wealth API] Portfolio fetch failed:', error instanceof Error ? error.message : 'Unknown');
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
  }
}
