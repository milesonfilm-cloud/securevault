import React from 'react';
import AppLayout from '@/components/AppLayout';
import FamilyManagementContent from './components/FamilyManagementContent';

export default function FamilyManagementPage() {
  return (
    <AppLayout activePath="/family-management">
      <FamilyManagementContent />
    </AppLayout>
  );
}
