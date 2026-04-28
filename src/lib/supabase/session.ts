import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let singleton: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return null;
  if (!singleton) singleton = createClient(url, key);
  return singleton;
}

/** Ensures a JWT exists for API routes (anonymous sign-in if needed). */
export async function ensureSupabaseSession(): Promise<void> {
  const sb = getSupabaseBrowser();
  if (!sb) return;
  const {
    data: { session },
  } = await sb.auth.getSession();
  if (session?.access_token) return;
  await sb.auth.signInAnonymously();
}

export async function getSupabaseAuthHeaders(): Promise<Record<string, string>> {
  await ensureSupabaseSession();
  const sb = getSupabaseBrowser();
  if (!sb) return {};
  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session?.access_token) return {};
  return { Authorization: `Bearer ${session.access_token}` };
}
