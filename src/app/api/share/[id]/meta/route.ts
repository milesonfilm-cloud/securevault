import { NextResponse } from 'next/server';
import { shareStorePeek } from '@/server/shareStore';

export const runtime = 'nodejs';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const meta = shareStorePeek(id);
  if (!meta) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  return NextResponse.json(meta);
}
