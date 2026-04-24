import React from 'react';
import AppLayout from '@/components/AppLayout';
import RenewalsContent from './RenewalsContent';

export default function RenewalsPage() {
  return (
    <AppLayout activePath="/renewals">
      <RenewalsContent />
    </AppLayout>
  );
}
