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
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
            <Fingerprint size={18} className="text-slate-400" />
          </div>
          <div>
            <h3 className="text-sm font-700 text-slate-700">Biometric Login</h3>
            <p className="text-xs text-slate-400">Fingerprint &amp; Face ID</p>
          </div>
        </div>
        <p className="text-xs text-slate-400 bg-slate-50 rounded-xl px-4 py-3">
          Biometric authentication is not available on this device or browser.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${registered ? 'bg-emerald-100' : 'bg-indigo-100'}`}
        >
          <Fingerprint size={18} className={registered ? 'text-emerald-600' : 'text-indigo-500'} />
        </div>
        <div>
          <h3 className="text-sm font-700 text-slate-700">Biometric Login</h3>
          <p className="text-xs text-slate-400">Fingerprint &amp; Face ID</p>
        </div>
        <div
          className={`ml-auto px-2.5 py-1 rounded-full text-xs font-600 ${registered ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}
        >
          {registered ? 'Enabled' : 'Disabled'}
        </div>
      </div>

      {/* Biometric types */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5">
          <Fingerprint size={16} className="text-indigo-400 flex-shrink-0" />
          <span className="text-xs text-slate-500">Fingerprint</span>
        </div>
        <div className="flex-1 flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5">
          <ScanFace size={16} className="text-violet-400 flex-shrink-0" />
          <span className="text-xs text-slate-500">Face ID</span>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-4">
        {registered
          ? 'Your biometric credential is registered. You can use it to unlock the vault quickly.'
          : 'Register your fingerprint or Face ID to unlock the vault without typing your password.'}
      </p>

      {message && (
        <div
          className={`flex items-center gap-2 rounded-xl px-3 py-2.5 mb-4 text-sm ${messageType === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${messageType === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}
          />
          {message}
        </div>
      )}

      {registered ? (
        <button
          onClick={handleDisable}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-sm font-600 transition-colors"
        >
          <ShieldOff size={15} />
          Disable Biometric Login
        </button>
      ) : (
        <button
          onClick={handleEnable}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-600 transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
          {loading ? 'Setting up…' : 'Enable Biometric Login'}
        </button>
      )}
    </div>
  );
}
