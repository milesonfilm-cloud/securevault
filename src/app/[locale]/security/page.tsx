import React from 'react';
import type { Metadata } from 'next';
import AppLayout from '@/components/AppLayout';
import SecurityContent from './components/SecurityContent';

export const metadata: Metadata = {
  title: 'Security & Architecture — SecureVault',
  description:
    'How SecureVault protects your family documents with AES-256-GCM, Argon2id, offline-first storage, and zero-knowledge design.',
};

export default function SecurityPage() {
  return (
    <AppLayout activePath="/security">
      <SecurityContent />
    </AppLayout>
  );
}
