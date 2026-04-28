'use client';

import { useEffect } from 'react';
import { ensureSupabaseSession } from '@/lib/supabase/session';

export default function SupabaseSessionBootstrap() {
  useEffect(() => {
    void ensureSupabaseSession();
  }, []);
  return null;
}
