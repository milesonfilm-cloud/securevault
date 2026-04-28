import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const defaultUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? '';
const defaultKey = () => {
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (svc) return svc;
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';
};

export async function requireAuth(
  request: Request
): Promise<{ ok: true; userId: string } | { ok: false; response: NextResponse }> {
  const supabaseUrl = defaultUrl();
  const supabaseKey = defaultKey();
  if (!supabaseUrl || !supabaseKey) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'auth_not_configured' }, { status: 503 }),
    };
  }

  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '');

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'unauthorized' }, { status: 401 }),
    };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'invalid_token' }, { status: 401 }),
    };
  }

  return { ok: true, userId: data.user.id };
}
