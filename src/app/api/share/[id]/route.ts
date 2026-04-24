import { NextResponse } from 'next/server';
import { shareStoreGet, shareStoreBumpView, shareStoreDelete } from '@/server/shareStore';

export const runtime = 'nodejs';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const entry = shareStoreGet(id);
  if (!entry) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  shareStoreBumpView(id);
  return NextResponse.json({
    cipherB64: entry.cipherB64,
    expiresAt: entry.expiresAt,
    views: entry.views,
  });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  shareStoreDelete(id);
  return NextResponse.json({ ok: true });
}
