'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';

/** One-line trust footer for vault app shells. */
export default function TrustFooter() {
  return (
    <footer className="shrink-0 border-t border-[color:var(--color-border)] bg-vault-panel/80 px-4 py-2.5 text-center backdrop-blur-sm">
      <p className="text-[10px] leading-relaxed text-vault-faint sm:text-[11px]">
        Your data never leaves your device. DPDP Act 2023 aligned.{' '}
        <Link
          href="/security"
          className="font-600 text-vault-warm underline decoration-vault-warm/30 underline-offset-2 hover:text-vault-text"
        >
          Security
        </Link>
        {' · '}
        <Link
          href="/about"
          className="font-600 text-vault-warm underline decoration-vault-warm/30 underline-offset-2 hover:text-vault-text"
        >
          About
        </Link>
      </p>
    </footer>
  );
}
