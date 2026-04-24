import React from 'react';
import { Info, Shield, Scale, Lock } from 'lucide-react';

export default function AboutContent() {
  return (
    <div className="mx-auto min-h-full max-w-screen-lg bg-vault-bg p-4 lg:p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-vault-faint">SecureVault</p>
          <h1 className="mt-0.5 text-[28px] font-bold leading-tight tracking-tight text-vault-text sm:text-[32px]">
            About
          </h1>
          <p className="mt-2 text-[13px] text-vault-muted">What it does and what to expect</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-vault-elevated text-vault-warm">
          <Info size={18} aria-hidden />
        </div>
      </div>

      <section className="neo-card mb-5 rounded-2xl p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-vault-elevated text-vault-warm">
            <Shield size={18} aria-hidden />
          </div>
          <h2 className="text-lg font-bold text-vault-text">What SecureVault is</h2>
        </div>
        <div className="space-y-3 text-sm leading-relaxed text-vault-muted">
          <p className="text-vault-text">
            SecureVault stores and organizes sensitive personal and family data{' '}
            <strong className="font-semibold text-vault-text">on this device</strong>, encrypted in
            this app. Vault contents are not uploaded to an app-operated cloud—only you export
            backups when you choose.
          </p>
          <p>
            If you <strong className="text-vault-text">forget your password</strong>, encrypted data
            cannot be recovered. Keep a strong passphrase and maintain your own backups if you
            need copies elsewhere.
          </p>
        </div>
      </section>

      <section className="neo-card mb-5 rounded-2xl p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-vault-elevated text-vault-warm">
            <Lock size={18} aria-hidden />
          </div>
          <h2 className="text-lg font-bold text-vault-text">Security &amp; expectations</h2>
        </div>
        <div className="space-y-3 text-sm leading-relaxed text-vault-muted">
          <p className="text-vault-text">
            Encryption uses the browser&apos;s{' '}
            <strong className="font-semibold text-vault-text">Web Crypto API</strong> (AES-256-GCM).
            <strong className="font-semibold text-vault-text"> New vaults</strong> derive keys with{' '}
            <strong className="font-semibold text-vault-text">Argon2id</strong> (WebAssembly);{' '}
            <strong className="font-semibold text-vault-text">older vaults</strong> may use
            PBKDF2-SHA256 with stored iteration counts. A password verifier uses SHA-256.
          </p>
          <p>
            Protection depends on your passphrase and backups. Client-side code can be inspected;
            strong crypto is what keeps ciphertext useless without your password. This is not a
            claim of &quot;unhackable&quot; software—use a long, unique passphrase and safe backup
            practices.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-vault-coral/35 bg-vault-elevated/40 p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-vault-coral/15 text-vault-coral">
            <Scale size={18} aria-hidden />
          </div>
          <h2 className="text-lg font-bold text-vault-text">Disclaimer</h2>
        </div>
        <div className="space-y-3 text-xs leading-relaxed text-vault-muted sm:text-sm">
          <p className="font-semibold uppercase tracking-wide text-vault-coral">Read carefully</p>
          <p>
            SecureVault is provided <strong className="text-vault-text">&quot;as is&quot;</strong>{' '}
            and <strong className="text-vault-text">&quot;as available&quot;</strong>, without
            warranties to the fullest extent permitted by law. The developers and contributors are{' '}
            <strong className="text-vault-text">not liable</strong> for loss or damage including data
            loss, failed backups or restores, device or browser issues, forgotten passwords, or
            software errors. To the maximum extent permitted by law, there is no liability for
            indirect, consequential, or punitive damages.
          </p>
          <p>
            Nothing here is legal, financial, or professional advice. This notice may be updated;
            continued use means you accept revisions.
          </p>
        </div>
      </section>
    </div>
  );
}
