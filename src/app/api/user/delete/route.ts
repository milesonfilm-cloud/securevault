import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/requireAuth';

export const runtime = 'nodejs';

export async function DELETE(_req: Request) {
  const auth = await requireAuth(_req);
  if (auth.ok === false) return auth.response;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) {
    return NextResponse.json({ error: 'account_deletion_unavailable' }, { status: 503 });
  }

  const supabase = createClient(url, serviceKey);
  const { error } = await supabase.auth.admin.deleteUser(auth.userId);

  if (error) {
    return NextResponse.json({ error: 'deletion_failed' }, { status: 500 });
  }

  return NextResponse.json({
    message:
      'Account deleted. Your encrypted vault data on this device was never stored on our servers. Clear your browser data / app storage to remove local data.',
    deletedAt: new Date().toISOString(),
  });
}
