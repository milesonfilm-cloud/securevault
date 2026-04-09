import React from 'react';
import AppLayout from '@/components/AppLayout';
import SettingsExportContent from './components/SettingsExportContent';

export default function SettingsExportPage() {
  return (
    <AppLayout activePath="/settings-export">
      <SettingsExportContent />
    </AppLayout>
  );
}
