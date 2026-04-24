import { NextResponse } from 'next/server';
import { handoverStoreGet } from '@/server/handoverStore';

export const runtime = 'nodejs';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const entry = handoverStoreGet(id);
  if (!entry) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  return NextResponse.json({
    cipherB64: entry.cipherB64,
    expiresAt: entry.expiresAt,
  });
}
