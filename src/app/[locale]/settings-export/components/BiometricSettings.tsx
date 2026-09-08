'use client';

import React, { useState, useEffect } from 'react';
import { Fingerprint, ScanFace, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  isBiometricAvailable,
  hasBiometricCredential,
  registerBiometric,
  clearBiometricCredential,
} from '@/lib/biometricAuth';

export default function BiometricSettings() {
  const t = useTranslations('settingsPanels');
  const [supported, setSupported] = useState(true);
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const available = await isBiometricAvailable();
      if (cancelled) return;
      setSupported(available);
      setRegistered(hasBiometricCredential());
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage(text);
    setMessageType(type);
    window.setTimeout(() => setMessage(''), 4500);
  };

  const handleToggle = async () => {
    if (loading) return;

    if (registered) {
      clearBiometricCredential();
      setRegistered(false);
      showMessage(t('biometricDisabledToast'), 'success');
      return;
    }

    if (!supported) {
      showMessage(t('biometricUnavailableBody'), 'error');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const result = await registerBiometric();
      if (result.ok) {
        setRegistered(true);
        showMessage(t('biometricEnableSuccess'), 'success');
      } else if (result.reason === 'cancelled') {
        showMessage(t('biometricCancelled'), 'error');
      } else if (result.reason === 'unavailable') {
        showMessage(t('biometricUnavailableBody'), 'error');
      } else {
        showMessage(t('biometricSetupFailed'), 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="neo-card rounded-2xl p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-border bg-vault-elevated">
          <Fingerprint size={18} className="text-vault-warm" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-700 text-vault-text">{t('biometricTitle')}</h3>
          <p className="text-xs text-vault-faint">{t('biometricSubtitle')}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={registered}
          aria-label={t('biometricTitle')}
          disabled={loading}
          onClick={() => void handleToggle()}
          className={cn(
            'sv-biometric-switch relative z-10 h-8 w-14 shrink-0 rounded-full transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-vault-warm/50',
            'disabled:cursor-wait disabled:opacity-70',
            registered ? 'bg-[#4338C9]' : 'bg-[rgba(44,37,64,0.22)]'
          )}
        >
          {loading ? (
            <Loader2
              size={14}
              className={cn(
                'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin',
                registered ? 'text-white' : 'text-vault-text'
              )}
            />
          ) : (
            <span
              className={cn(
                'sv-biometric-switch-knob absolute top-1 h-6 w-6 rounded-full shadow-md transition-all duration-200',
                registered ? 'right-1 left-auto' : 'left-1 right-auto'
              )}
            />
          )}
        </button>
      </div>

      <div className="mb-4 flex gap-3">
        <div className="neo-inset flex flex-1 items-center gap-2 rounded-2xl px-3 py-2.5">
          <Fingerprint size={16} className="shrink-0 text-vault-warm" />
          <span className="text-xs text-vault-muted">{t('fingerprint')}</span>
        </div>
        <div className="neo-inset flex flex-1 items-center gap-2 rounded-2xl px-3 py-2.5">
          <ScanFace size={16} className="shrink-0 text-vault-warm" />
          <span className="text-xs text-vault-muted">{t('faceId')}</span>
        </div>
      </div>

      <p className="mb-0 text-xs text-vault-faint">
        {!supported
          ? t('biometricUnavailableBody')
          : registered
            ? t('biometricHintRegistered')
            : t('biometricHintRegister')}
      </p>

      {message ? (
        <div
          className={`mt-4 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm ${
            messageType === 'success'
              ? 'border border-vault-warm/25 bg-vault-warm/15 text-vault-text'
              : 'border border-red-500/25 bg-red-500/10 text-red-700'
          }`}
        >
          <div
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
              messageType === 'success' ? 'bg-vault-warm' : 'bg-red-400'
            }`}
          />
          {message}
        </div>
      ) : null}
    </div>
  );
}
