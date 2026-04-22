import React, { Suspense } from 'react';
import AppLayout from '@/components/AppLayout';
import DocumentVaultContent from './components/DocumentVaultContent';

export default function DocumentVaultPage() {
  return (
    <AppLayout activePath="/document-vault">
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center p-6 text-sm text-vault-muted">
            Loading vault…
          </div>
        }
      >
        <DocumentVaultContent />
      </Suspense>
    </AppLayout>
  );
}
