import React from 'react';
import AppLayout from '@/components/AppLayout';
import DocumentVaultContent from './components/DocumentVaultContent';

export default function DocumentVaultPage() {
  return (
    <AppLayout activePath="/document-vault">
      <DocumentVaultContent />
    </AppLayout>
  );
}
