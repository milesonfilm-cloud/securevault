import React, { Suspense } from 'react';
import SharePageClient from './SharePageClient';

export default function SharePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen neo-bg flex items-center justify-center text-sm text-vault-muted">
          Loading…
        </div>
      }
    >
      <SharePageClient />
    </Suspense>
  );
}
