import React from 'react';
import AppLayout from '@/components/AppLayout';
import ProgressContent from './ProgressContent';

export default function ProgressPage() {
  return (
    <AppLayout activePath="/progress">
      <ProgressContent />
    </AppLayout>
  );
}
