'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Shield, Eye, EyeOff, Lock, Fingerprint, CheckCircle2, ScanFace } from 'lucide-react';
import BackupReminderBanner from '@/components/ui/BackupReminderBanner';
import AuthWelcomePanel from '@/components/AuthWelcomePanel';
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
  getVaultKey,
  SESSION_UNLOCKED_KEY,
  setStoredKdfParams,
  setStoredVerifier,
  setVaultKey,
} from '@/lib/vaultSession';
import { persistUnlockedVaultKey, tryRestoreVaultKeyFromPersist } from '@/lib/vaultKeyPersist';
import { computePinVerifier, deriveAesKeyFromPin, newKdfParams } from '@/lib/crypto/vaultCrypto';
import { resetVaultLocalOnly } from '@/lib/storage';
import { AUTH_INTRO_SESSION_KEY, completeAuthIntroSession } from '@/lib/authIntroSession';

const SESSION_KEY = SESSION_UNLOCKED_KEY;

function safeSessionSet(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

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
  const [introChecked, setIntroChecked] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  /** Shown on login after biometric gate — PIN still required to derive CryptoKey */
  const [loginHint, setLoginHint] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedVerifier = getStoredVerifier();

    const init = async () => {
      const supported = isBiometricSupported();
      if (supported) {
        const available = await isPlatformAuthenticatorAvailable();
        setBiometricAvailable(available);
        setBiometricRegistered(hasBiometricCredential());
      }

      if (!storedVerifier) {
        setPhase('setup');
      } else {
        const restored = await tryRestoreVaultKeyFromPersist();
        if (restored) {
          setVaultKey(restored);
          safeSessionSet(SESSION_KEY, 'true');
          setPhase('unlocked');
        } else {
          setPhase('login');
        }
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (phase !== 'setup' && phase !== 'login') return;
    try {
      const done = sessionStorage.getItem(AUTH_INTRO_SESSION_KEY) === '1';
      setShowIntro(!done);
    } catch {
      setShowIntro(true);
    }
    setIntroChecked(true);
  }, [phase]);

  useEffect(() => {
    if (showIntro) return;
    if (phase === 'setup' || phase === 'login') {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [phase, showIntro]);

  const completeAuthIntro = useCallback(() => {
    completeAuthIntroSession();
    setShowIntro(false);
  }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const unlockVault = useCallback(() => {
    void (async () => {
      try {
        await persistUnlockedVaultKey(getVaultKey());
      } catch {
        /* ignore */
      }
    })();
    safeSessionSet(SESSION_KEY, 'true');
    setSuccess(true);
    setPhase('unlocked');
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
    void (async () => {
      try {
        const params = newKdfParams();
        const key = await deriveAesKeyFromPin(pin, params);
        const verifier = await computePinVerifier(key);
        setStoredKdfParams(params);
        setStoredVerifier(verifier);
        setVaultKey(key);
        if (biometricAvailable && !biometricRegistered) {
          setBiometricSetupOffer(true);
        } else {
          unlockVault();
        }
      } catch {
        setError('Could not create vault. Try again.');
        triggerShake();
      }
    })();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoginHint('');
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
        if (!getStoredVerifier() || !getStoredKdfParams()) {
          throw new Error('not_initialized');
        }
        // Biometrics prove presence; the AES key is still derived from PIN only.
        setLoginHint('Identity verified. Enter your password to decrypt the vault.');
        setPhase('login');
        setPin('');
        setTimeout(() => inputRef.current?.focus(), 100);
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
        <div className="relative w-full max-w-sm auth-card animate-auth-in">
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-2xl bg-vault-elevated border border-[rgba(255,255,255,0.07)] flex items-center justify-center">
                <Fingerprint size={36} className="text-vault-warm" />
              </div>
            </div>
            <h1 className="text-2xl font-800 text-white tracking-tight">Enable Biometrics</h1>
            <p className="text-sm text-vault-muted mt-1 text-center">
              Use fingerprint or Face ID for quick, secure access
            </p>
          </div>

          {/* Biometric type indicators */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 flex flex-col items-center gap-2 bg-vault-elevated border border-[rgba(255,255,255,0.07)] rounded-2xl p-4">
              <Fingerprint size={24} className="text-vault-warm" />
              <span className="text-xs text-vault-muted text-center">Fingerprint</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2 bg-vault-elevated border border-[rgba(255,255,255,0.07)] rounded-2xl p-4">
              <ScanFace size={24} className="text-vault-warm" />
              <span className="text-xs text-vault-muted text-center">Face ID</span>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2.5 mb-4 animate-fade-in">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <button
            onClick={handleRegisterBiometric}
            disabled={biometricLoading}
            className="auth-btn w-full mb-3"
          >
            {biometricLoading ? (
              <div className="w-4 h-4 border-2 border-vault-ink/30 border-t-vault-ink rounded-full animate-spin" />
            ) : (
              <Fingerprint size={18} />
            )}
            {biometricLoading ? 'Setting up…' : 'Enable Biometric Login'}
          </button>

          <button
            onClick={skipBiometricSetup}
            className="w-full py-3 text-sm text-vault-muted hover:text-vault-warm transition-colors"
          >
            Skip for now
          </button>

          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-vault-warm" />
            <p className="text-xs text-vault-faint">100% offline · stored on this device only</p>
          </div>
        </div>
      </div>
    );
  }

  if (!introChecked) {
    return (
      <div className="min-h-screen auth-bg flex items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className="min-h-screen auth-bg flex flex-col items-center justify-center p-4 py-10 relative overflow-x-hidden">
        <AuthWelcomePanel phase={phase} onFinish={completeAuthIntro} />
      </div>
    );
  }

  return (
    <div className="min-h-screen auth-bg flex flex-col items-center justify-center p-4 py-10 relative overflow-y-auto overflow-x-hidden">
      {/* Card */}
      <div
        className={`relative w-full max-w-lg auth-card animate-auth-in ${shake ? 'animate-shake' : ''}`}
      >
        {/* Icon */}
        <div className="flex flex-col items-center mb-8">
          <div
            className={`relative mb-4 transition-all duration-500 ${success ? 'scale-110' : ''}`}
          >
            <div className="w-20 h-20 rounded-2xl bg-vault-elevated border border-[rgba(255,255,255,0.07)] flex items-center justify-center">
              {success ? (
                <CheckCircle2 size={36} className="text-vault-warm animate-scale-in" />
              ) : phase === 'setup' ? (
                <Shield size={36} className="text-vault-warm" />
              ) : (
                <Lock size={36} className="text-vault-warm" />
              )}
            </div>
          </div>

          <h1 className="text-2xl font-800 text-white tracking-tight">
            {success ? 'Welcome!' : phase === 'setup' ? 'Create Password' : 'Unlock vault'}
          </h1>
          <p className="text-sm text-vault-muted mt-1 text-center">
            {success
              ? 'Unlocking your vault…'
              : phase === 'setup'
                ? 'Set a password to protect your vault'
                : 'Enter your password to continue'}
          </p>
        </div>

        {/* Biometric quick-login button (login phase only, if registered) */}
        {!success &&
          phase === 'login' &&
          biometricAvailable &&
          biometricRegistered &&
          !loginHint && (
            <button
              onClick={handleBiometricLogin}
              disabled={biometricLoading}
              className="w-full mb-5 flex flex-col items-center gap-2 bg-vault-elevated hover:bg-vault-panel border border-[rgba(255,255,255,0.07)] rounded-2xl py-4 px-4 transition-all duration-200 group"
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-[#312C51] border border-[rgba(255,255,255,0.07)] flex items-center justify-center transition-all duration-200">
                  {biometricLoading ? (
                    <div className="w-6 h-6 border-2 border-vault-faint border-t-vault-warm rounded-full animate-spin" />
                  ) : (
                    <Fingerprint size={28} className="text-vault-warm transition-colors" />
                  )}
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-700 text-white transition-colors">
                  {biometricLoading ? 'Authenticating…' : 'Use Biometrics'}
                </p>
                <p className="text-xs text-vault-muted mt-0.5">Fingerprint or Face ID</p>
              </div>
            </button>
          )}

        {/* Divider */}
        {!success &&
          phase === 'login' &&
          biometricAvailable &&
          biometricRegistered &&
          !loginHint && (
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-[rgba(255,255,255,0.07)]" />
              <span className="text-xs text-vault-faint font-600">or use password</span>
              <div className="flex-1 h-px bg-[rgba(255,255,255,0.07)]" />
            </div>
          )}

        {/* Form */}
        {!success && (
          <form onSubmit={phase === 'setup' ? handleSetup : handleLogin} className="space-y-4">
            {/* Password field */}
            <div className="space-y-1.5">
              <label className="text-xs font-700 text-vault-muted uppercase tracking-widest">
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
                    setLoginHint('');
                  }}
                  placeholder="Enter password"
                  className="auth-input pr-11"
                  autoComplete={phase === 'setup' ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPin((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-vault-faint hover:text-vault-warm transition-colors"
                >
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm field (setup only) */}
            {phase === 'setup' && (
              <div className="space-y-1.5">
                <label className="text-xs font-700 text-vault-muted uppercase tracking-widest">
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-vault-faint hover:text-vault-warm transition-colors"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {phase === 'login' && loginHint && (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-3 py-2.5 animate-fade-in">
                <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                <p className="text-sm text-emerald-200/95">{loginHint}</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2.5 animate-fade-in">
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
            className="mt-4 w-full text-center text-xs text-vault-muted hover:text-vault-warm transition-colors"
          >
            Forgot password? Reset vault (data will be lost without backup)
          </button>
        )}

        {/* Biometric setup hint (login phase, available but not registered) */}
        {!success && phase === 'login' && biometricAvailable && !biometricRegistered && (
          <p className="mt-4 text-center text-xs text-vault-faint">
            Tip: Enable biometric login after unlocking via Settings
          </p>
        )}

        {/* Footer */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-vault-warm" />
          <p className="text-xs text-vault-faint">100% offline · stored on this device only</p>
        </div>
      </div>
    </div>
  );
}
