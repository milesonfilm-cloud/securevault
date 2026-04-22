'use client';

import React from 'react';
import { Smartphone, CheckCircle2 } from 'lucide-react';

/**
 * Shipped as a packaged app build — not a “install from browser / Add to Home Screen” PWA flow.
 */
export default function AppInfoCard() {
  return (
    <div className="neo-card rounded-2xl p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-vault-elevated">
          <Smartphone size={20} className="text-vault-warm" />
        </div>
        <div>
          <h3 className="text-base font-700 text-vault-text">SecureVault on this device</h3>
          <p className="text-xs text-vault-faint">Installed app — not a web install prompt</p>
        </div>
      </div>

      <ul className="mb-4 space-y-2">
        {[
          'Vault works offline once the app is open — no cloud sync',
          'Data stays on this device unless you export a backup',
          'Use Backup & Export below for encrypted JSON files',
        ].map((line, i) => (
          <li key={`app-info-${i}`} className="flex items-start gap-2 text-xs text-vault-muted">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-vault-warm/60" />
            <span>{line}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-start gap-2 rounded-2xl border border-border bg-vault-elevated px-4 py-3">
        <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-vault-warm" aria-hidden />
        <p className="text-xs leading-relaxed text-vault-muted">
          This build is distributed as an <strong className="text-vault-text">app on your device</strong>
          . There is no separate browser step to “install” or add to the home screen for this release.
        </p>
      </div>
    </div>
  );
}
