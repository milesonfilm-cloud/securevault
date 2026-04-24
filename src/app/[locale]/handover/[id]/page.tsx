import React, { Suspense } from 'react';
import HandoverPageClient from './HandoverPageClient';

export default function HandoverPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen neo-bg flex items-center justify-center text-sm text-vault-muted">
          Loading…
        </div>
      }
    >
      <HandoverPageClient />
    </Suspense>
  );
}
