'use client';

import React, { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { encryptJson } from '@/lib/crypto/vaultCrypto';
import { generateTotpSecret, getTotpUri, verifyTotp } from '@/lib/totp';
import { saveTotpSecretEncrypted, setTotpEnabled } from '@/lib/totpSettings';
import { getVaultKey } from '@/lib/vaultSession';
import QRCode from 'qrcode';

interface TotpSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TotpSetupModal({ isOpen, onClose }: TotpSetupModalProps) {
  const [secret, setSecret] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const s = generateTotpSecret();
    setSecret(s);
    setToken('');
    setError('');
    void (async () => {
      const uri = getTotpUri(s, 'Strong Vault');
      const url = await QRCode.toDataURL(uri, { width: 200, margin: 1 });
      setQrDataUrl(url);
    })();
  }, [isOpen]);

  const handleVerify = async () => {
    const key = getVaultKey();
    if (!key) {
      setError('Vault not unlocked');
      return;
    }
    const code = token.replace(/\s/g, '');
    if (!verifyTotp(secret, code)) {
      setError('Invalid code');
      return;
    }
    try {
      const enc = await encryptJson(key, { secret });
      saveTotpSecretEncrypted(enc);
      setTotpEnabled(true);
      onClose();
    } catch {
      setError('Could not save — try again');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Authenticator app (2FA)"
      subtitle="Scan the QR code, then enter a 6-digit code to confirm. The secret is encrypted with your vault key."
      size="md"
    >
      <div className="max-h-[70vh] space-y-4 overflow-y-auto p-6">
        {qrDataUrl ? (
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="QR code for authenticator setup" width={200} height={200} />
          </div>
        ) : (
          <p className="text-center text-sm text-vault-muted">Generating QR code…</p>
        )}
        <p className="text-xs text-vault-muted leading-relaxed">
          Use Google Authenticator, Authy, or any TOTP app. If you cannot scan, add manually: issuer{' '}
          <strong>Strong Vault</strong>, algorithm SHA1, 6 digits, 30s period.
        </p>
        <div>
          <label className="mb-1 block text-xs font-700 uppercase tracking-wider text-vault-muted">
            Verification code
          </label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={token}
            onChange={(e) => {
              setToken(e.target.value.replace(/[^\d]/g, '').slice(0, 6));
              setError('');
            }}
            className="auth-input w-full text-center font-mono text-lg tracking-[0.3em]"
            placeholder="000000"
            maxLength={6}
          />
        </div>
        {error ? (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}
        <button type="button" className="auth-btn w-full" onClick={() => void handleVerify()}>
          Enable 2FA
        </button>
      </div>
    </Modal>
  );
}
