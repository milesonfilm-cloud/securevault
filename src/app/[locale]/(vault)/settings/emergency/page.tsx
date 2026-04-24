import React from 'react';
import AppLayout from '@/components/AppLayout';
import EmergencySettingsContent from './EmergencySettingsContent';

export default function EmergencySettingsPage() {
  return (
    <AppLayout activePath="/settings-export">
      <EmergencySettingsContent />
    </AppLayout>
  );
}
