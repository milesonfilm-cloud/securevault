import React from 'react';
import AppLayout from '@/components/AppLayout';
import AboutContent from './components/AboutContent';

export default function AboutPage() {
  return (
    <AppLayout activePath="/about">
      <AboutContent />
    </AppLayout>
  );
}
