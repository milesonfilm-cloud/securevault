'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Shield, Eye, EyeOff, Lock, Fingerprint, CheckCircle2, ScanFace } from 'lucide-react';
import BackupReminderBanner from '@/components/ui/BackupReminderBanner';
import {
  isBiometricSupported,
  isPlatformAuthenticatorAvailable,
  hasBiometricCredential,
  registerBiometric,
  authenticateWithBiometric,
} from '@/lib/webauthn';
import {
  clearVaultKey,
  getStoredKdfParams,
  getStoredVerifier,
  SESSION_UNLOCKED_KEY,
  setStoredKdfParams,
  setStoredVerifier,
  setVaultKey,
} from '@/lib/vaultSession';
import { computePinVerifier, deriveAesKeyFromPin, newKdfParams } from '@/lib/crypto/vaultCrypto';
import { resetVaultLocalOnly } from '@/lib/storage';

const SESSION_KEY = SESSION_UNLOCKED_KEY;

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [phase, setPhase] = useState<'loading' | 'setup' | 'login' | 'unlocked'>('loading');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricRegistered, setBiometricRegistered] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [biometricSetupOffer, setBiometricSetupOffer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedVerifier = getStoredVerifier();
    const session = sessionStorage.getItem(SESSION_KEY);

    const init = async () => {
      const supported = isBiometricSupported();
      if (supported) {
        const available = await isPlatformAuthenticatorAvailable();
        setBiometricAvailable(available);
        setBiometricRegistered(hasBiometricCredential());
      }

      if (!storedVerifier) {
        setPhase('setup');
      } else if (session === 'true') {
        setPhase('unlocked');
      } else {
        setPhase('login');
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (phase === 'setup' || phase === 'login') {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [phase]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const unlockVault = useCallback(() => {
    sessionStorage.setItem(SESSION_KEY, 'true');
    setSuccess(true);
    setTimeout(() => setPhase('unlocked'), 700);
  }, []);

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (pin.length < 4) {
      setError('Password must be at least 4 characters');
      triggerShake();
      return;
    }
    if (pin !== confirmPin) {
      setError('Passwords do not match');
      triggerShake();
      setConfirmPin('');
      return;
    }
    (async () => {
      const params = newKdfParams();
      const key = await deriveAesKeyFromPin(pin, params);
      const verifier = await computePinVerifier(key);
      setStoredKdfParams(params);
      setStoredVerifier(verifier);
      setVaultKey(key);
    })().catch(() => {});

    // Offer biometric setup after password creation if available
    if (biometricAvailable && !biometricRegistered) {
      setBiometricSetupOffer(true);
    } else {
      unlockVault();
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    (async () => {
      const params = getStoredKdfParams();
      const verifier = getStoredVerifier();
      if (!params || !verifier) throw new Error('not_initialized');
      const key = await deriveAesKeyFromPin(pin, params);
      const got = await computePinVerifier(key);
      if (got !== verifier) throw new Error('bad_pin');
      setVaultKey(key);
      unlockVault();
    })().catch(() => {
      setError('Incorrect password. Please try again.');
      triggerShake();
      setPin('');
    });
  };

  const handleBiometricLogin = async () => {
    setBiometricLoading(true);
    setError('');
    try {
      const ok = await authenticateWithBiometric();
      if (ok) {
        // Biometrics are a convenience gate; the vault key is still derived from PIN.
        // If the session key isn't available, prompt for PIN.
        // (A true biometric-only unlock requires OS-keystore-backed key storage, which is mobile-native.)
        if (!getStoredVerifier() || !getStoredKdfParams()) {
          throw new Error('not_initialized');
        }
        unlockVault();
      } else {
        setError('Biometric authentication failed. Use your password.');
        triggerShake();
      }
    } catch {
      setError('Biometric not available. Use your password.');
      triggerShake();
    } finally {
      setBiometricLoading(false);
    }
  };

  const handleRegisterBiometric = async () => {
    setBiometricLoading(true);
    setError('');
    try {
      const ok = await registerBiometric();
      if (ok) {
        setBiometricRegistered(true);
        unlockVault();
      } else {
        setError('Biometric setup failed. You can enable it later in settings.');
        unlockVault();
      }
    } catch {
      setError('Biometric setup failed.');
      unlockVault();
    } finally {
      setBiometricLoading(false);
    }
  };

  const skipBiometricSetup = () => {
    unlockVault();
  };

  const handleForgotPin = async () => {
    setError('');
    const ok = window.confirm(
      'Resetting will permanently delete your local vault data on this device.\\n\\nIf you have an encrypted backup file, you can restore after reset.\\n\\nContinue?'
    );
    if (!ok) return;
    await resetVaultLocalOnly();
    clearVaultKey();
    setPin('');
    setConfirmPin('');
    setPhase('setup');
  };

  if (phase === 'loading') {
    return (
      <div className="min-h-screen auth-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (phase === 'unlocked') {
    return <>{children}</>;
  }

  // Biometric setup offer screen (shown after password creation)
  if (biometricSetupOffer) {
    return (
      <div className="min-h-screen auth-bg flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-[120px] pointer-events-none" />

        <div className="relative w-full max-w-sm auth-card animate-auth-in">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                <Fingerprint size={36} className="text-white" />
              </div>
              <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 blur-xl opacity-40 -z-10" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Enable Biometrics</h1>
            <p className="text-sm text-white/50 mt-1 text-center">
              Use fingerprint or Face ID for quick, secure access
            </p>
          </div>

          {/* Biometric type indicators */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 flex flex-col items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-4">
              <Fingerprint size={24} className="text-emerald-400" />
              <span className="text-xs text-white/60 text-center">Fingerprint</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-4">
              <ScanFace size={24} className="text-cyan-400" />
              <span className="text-xs text-white/60 text-center">Face ID</span>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 mb-4 animate-fade-in">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <button
            onClick={handleRegisterBiometric}
            disabled={biometricLoading}
            className="auth-btn w-full mb-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
          >
            {biometricLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Fingerprint size={18} />
            )}
            {biometricLoading ? 'Setting up…' : 'Enable Biometric Login'}
          </button>

          <button
            onClick={skipBiometricSetup}
            className="w-full py-3 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            Skip for now
          </button>

          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <p className="text-xs text-white/30">100% offline · stored on this device only</p>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen auth-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-indigo-400/10 blur-[80px] pointer-events-none" />

      {/* Card */}
      <div
        className={`relative w-full max-w-sm auth-card animate-auth-in ${shake ? 'animate-shake' : ''}`}
      >
        {/* Top glow line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        {/* Icon */}
        <div className="flex flex-col items-center mb-8">
          <div
            className={`relative mb-4 transition-all duration-500 ${success ? 'scale-110' : ''}`}
          >
            <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-500 flex items-center justify-center shadow-2xl shadow-indigo-500/40">
              {success ? (
                <CheckCircle2 size={36} className="text-white animate-scale-in" />
              ) : phase === 'setup' ? (
                <Shield size={36} className="text-white" />
              ) : (
                <Lock size={36} className="text-white" />
              )}
            </div>
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-500 blur-xl opacity-40 -z-10" />
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight">
            {success ? 'Welcome!' : phase === 'setup' ? 'Create Password' : 'SecureVault'}
          </h1>
          <p className="text-sm text-white/50 mt-1 text-center">
            {success
              ? 'Unlocking your vault…'
              : phase === 'setup'
                ? 'Set a password to protect your vault'
                : 'Enter your password to continue'}
          </p>
        </div>

        {/* Biometric quick-login button (login phase only, if registered) */}
        {!success && phase === 'login' && biometricAvailable && biometricRegistered && (
          <button
            onClick={handleBiometricLogin}
            disabled={biometricLoading}
            className="w-full mb-5 flex flex-col items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/40 rounded-2xl py-4 px-4 transition-all duration-200 group"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 flex items-center justify-center group-hover:border-violet-400/60 transition-all duration-200">
                {biometricLoading ? (
                  <div className="w-6 h-6 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
                ) : (
                  <Fingerprint
                    size={28}
                    className="text-violet-400 group-hover:text-violet-300 transition-colors"
                  />
                )}
              </div>
              {/* Pulse ring when not loading */}
              {!biometricLoading && (
                <div className="absolute inset-0 rounded-2xl border border-violet-500/20 animate-ping opacity-30" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
                {biometricLoading ? 'Authenticating…' : 'Use Biometrics'}
              </p>
              <p className="text-xs text-white/30 mt-0.5">Fingerprint or Face ID</p>
            </div>
          </button>
        )}

        {/* Divider */}
        {!success && phase === 'login' && biometricAvailable && biometricRegistered && (
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/30 font-medium">or use password</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
        )}

        {/* Form */}
        {!success && (
          <form onSubmit={phase === 'setup' ? handleSetup : handleLogin} className="space-y-4">
            {/* Password field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">
                {phase === 'setup' ? 'New Password' : 'Password'}
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter password"
                  className="auth-input pr-11"
                  autoComplete={phase === 'setup' ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPin((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                >
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm field (setup only) */}
            {phase === 'setup' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPin}
                    onChange={(e) => {
                      setConfirmPin(e.target.value);
                      setError('');
                    }}
                    placeholder="Confirm password"
                    className="auth-input pr-11"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 animate-fade-in">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button type="submit" className="auth-btn w-full mt-2">
              <Lock size={18} />
              {phase === 'setup' ? 'Create Vault Password' : 'Unlock Vault'}
            </button>
          </form>
        )}

        {!success && (phase === 'setup' || phase === 'login') && (
          <BackupReminderBanner variant="dark" className="mt-5" />
        )}

        {!success && phase === 'login' && (
          <button
            type="button"
            onClick={handleForgotPin}
            className="mt-4 w-full text-center text-xs text-white/35 hover:text-white/60 transition-colors"
          >
            Forgot password? Reset vault (data will be lost without backup)
          </button>
        )}

        {/* Biometric setup hint (login phase, available but not registered) */}
        {!success && phase === 'login' && biometricAvailable && !biometricRegistered && (
          <p className="mt-4 text-center text-xs text-white/25">
            Tip: Enable biometric login after unlocking via Settings
          </p>
        )}

        {/* Footer */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <p className="text-xs text-white/30">100% offline · stored on this device only</p>
        </div>

        {/* Bottom glow line */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    </div>
  );
}
