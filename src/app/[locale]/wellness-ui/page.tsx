import React from 'react';
import AppLayout from '@/components/AppLayout';
import WellnessUiClient from '@/components/wellness-mock/WellnessUiClient';

export default function WellnessUiPage() {
  return (
    <AppLayout activePath="/wellness-ui">
      <WellnessUiClient />
    </AppLayout>
  );
}
