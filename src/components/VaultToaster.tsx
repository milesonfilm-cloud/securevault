'use client';

import React, { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { subscribeMatchMedia } from '@/lib/matchMediaSubscribe';

/** Mobile: top toasts so they clear the bottom tab bar; desktop: bottom-right. */
export default function VaultToaster() {
  const [position, setPosition] = useState<'top-center' | 'bottom-right'>('top-center');

  useEffect(() => {
    return subscribeMatchMedia('(min-width: 1024px)', (wide) => {
      setPosition(wide ? 'bottom-right' : 'top-center');
    });
  }, []);

  return (
    <Toaster
      position={position}
      closeButton
      duration={5000}
      offset={position === 'top-center' ? 12 : 20}
      toastOptions={{
        duration: 5000,
        closeButton: true,
        style: {
          fontFamily: 'inherit',
          fontSize: '14px',
        },
      }}
    />
  );
}
