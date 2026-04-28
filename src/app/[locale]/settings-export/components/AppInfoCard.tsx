'use client';

import React from 'react';
import { Smartphone } from 'lucide-react';

export default function AppInfoCard() {
  return (
    <div className="neo-card rounded-2xl p-5">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-border bg-vault-elevated">
          <Smartphone size={18} className="text-vault-warm" />
        </div>
        <h3 className="text-sm font-800 text-vault-text">This device</h3>
      </div>
      <p className="text-xs leading-relaxed text-vault-muted">
        Your vault stays in local app storage. Export a backup if you need a file copy or to move to
        another device.
      </p>
    </div>
  );
}
