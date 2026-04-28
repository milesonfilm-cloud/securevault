import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/requireAuth';

export const runtime = 'nodejs';

export async function GET(_req: Request) {
  const auth = await requireAuth(_req);
  if (auth.ok === false) return auth.response;

  return NextResponse.json({
    message:
      'Your vault data is stored encrypted on your device. Use the in-app Export function (Settings → Export) to download your encrypted vault. This endpoint provides only server-side account metadata.',
    userId: auth.userId,
    requestedAt: new Date().toISOString(),
    dataLocation: 'client-device (IndexedDB), optional encrypted Google Drive backup',
    thirdPartyProcessors: [
      {
        name: 'Anthropic',
        purpose: 'AI document scan (OCR text only, when you use the scan feature)',
        dpa: 'https://www.anthropic.com/privacy',
      },
      {
        name: 'Supabase',
        purpose: 'Authentication and encrypted sync',
        dpa: 'https://supabase.com/privacy',
      },
      {
        name: 'Google',
        purpose: 'Optional encrypted Drive backup; DigiLocker OAuth',
        dpa: 'https://policies.google.com/privacy',
      },
    ],
  });
}
