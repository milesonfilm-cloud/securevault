'use client';

import React, { useState, useEffect } from 'react';
import { Fingerprint, ScanFace, ShieldCheck, ShieldOff, Loader2 } from 'lucide-react';
import {
  isBiometricSupported,
  isPlatformAuthenticatorAvailable,
  hasBiometricCredential,
  registerBiometric,
  clearBiometricCredential,
} from '@/lib/webauthn';

export default function BiometricSettings() {
  const [supported, setSupported] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      if (isBiometricSupported()) {
        const available = await isPlatformAuthenticatorAvailable();
        setSupported(available);
        setRegistered(hasBiometricCredential());
      }
      setChecking(false);
    };
    check();
  }, []);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3500);
  };

  const handleEnable = async () => {
    setLoading(true);
    setMessage('');
    const ok = await registerBiometric();
    if (ok) {
      setRegistered(true);
      showMessage('Biometric login enabled successfully!', 'success');
    } else {
      showMessage('Setup failed. Please try again.', 'error');
    }
    setLoading(false);
  };

  const handleDisable = () => {
    clearBiometricCredential();
    setRegistered(false);
    showMessage('Biometric login disabled.', 'success');
  };

  if (checking) return null;

  if (!supported) {
    return (
      <div className="neo-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-vault-elevated border border-[rgba(255,255,255,0.07)] rounded-2xl flex items-center justify-center">
            <Fingerprint size={18} className="text-vault-warm" />
          </div>
          <div>
            <h3 className="text-sm font-700 text-white">Biometric Login</h3>
            <p className="text-xs text-vault-faint">Fingerprint &amp; Face ID</p>
          </div>
        </div>
        <p className="text-xs text-vault-muted neo-inset rounded-2xl px-4 py-3">
          Biometric authentication is not available on this device or browser.
        </p>
      </div>
    );
  }

  return (
    <div className="neo-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center bg-vault-elevated border border-[rgba(255,255,255,0.07)]">
          <Fingerprint size={18} className="text-vault-warm" />
        </div>
        <div>
          <h3 className="text-sm font-700 text-white">Biometric Login</h3>
          <p className="text-xs text-vault-faint">Fingerprint &amp; Face ID</p>
        </div>
        <div
          className={`ml-auto px-2.5 py-1 rounded-full text-xs font-700 border ${
            registered
              ? 'bg-vault-warm/20 text-vault-warm border-vault-warm/35'
              : 'bg-vault-elevated text-vault-muted border-[rgba(255,255,255,0.08)]'
          }`}
        >
          {registered ? 'Enabled' : 'Disabled'}
        </div>
      </div>

      {/* Biometric types */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 neo-inset rounded-2xl px-3 py-2.5">
          <Fingerprint size={16} className="text-vault-warm flex-shrink-0" />
          <span className="text-xs text-vault-muted">Fingerprint</span>
        </div>
        <div className="flex-1 flex items-center gap-2 neo-inset rounded-2xl px-3 py-2.5">
          <ScanFace size={16} className="text-vault-warm flex-shrink-0" />
          <span className="text-xs text-vault-muted">Face ID</span>
        </div>
      </div>

      <p className="text-xs text-vault-faint mb-4">
        {registered
          ? 'Your biometric credential is registered. You can use it to unlock the vault quickly.'
          : 'Register your fingerprint or Face ID to unlock the vault without typing your password.'}
      </p>

      {message && (
        <div
          className={`flex items-center gap-2 rounded-xl px-3 py-2.5 mb-4 text-sm ${messageType === 'success' ? 'bg-vault-warm/15 text-vault-warm border border-vault-warm/25' : 'bg-red-500/10 text-red-300 border border-red-500/25'}`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${messageType === 'success' ? 'bg-vault-warm' : 'bg-red-400'}`}
          />
          {message}
        </div>
      )}

      {registered ? (
        <button
          onClick={handleDisable}
          className="neo-btn neo-btn-secondary w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl border border-red-400/50 text-red-300 hover:bg-red-500/10 text-sm font-700 transition-colors"
        >
          <ShieldOff size={15} />
          Disable Biometric Login
        </button>
      ) : (
        <button
          onClick={handleEnable}
          disabled={loading}
          className="neo-btn neo-btn-primary w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-800 transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
          {loading ? 'Setting up…' : 'Enable Biometric Login'}
        </button>
      )}
    </div>
  );
}
