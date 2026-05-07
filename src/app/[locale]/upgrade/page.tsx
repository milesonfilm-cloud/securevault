import React from 'react';
import AppLayout from '@/components/AppLayout';
import UpgradeContent from './components/UpgradeContent';

export default function UpgradePage() {
  return (
    <AppLayout activePath="/upgrade">
      <UpgradeContent />
    </AppLayout>
  );
}
