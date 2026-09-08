'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import AppLayout from '@/components/AppLayout';

function DocumentVaultRedirect() {
  const router = useRouter();
  const search = useSearchParams();

  useEffect(() => {
    const member = search.get('member');
    const qs = member ? `?member=${encodeURIComponent(member)}` : '';
    router.replace(`/family-management${qs}`);
  }, [router, search]);

  return <div className="min-h-[40vh] bg-transparent" />;
}

export default function DocumentVaultRedirectPage() {
  return (
    <AppLayout activePath="/family-management">
      <Suspense fallback={<div className="min-h-[40vh] bg-transparent" />}>
        <DocumentVaultRedirect />
      </Suspense>
    </AppLayout>
  );
}
