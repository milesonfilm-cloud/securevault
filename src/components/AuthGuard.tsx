'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff, Lock, Fingerprint, CheckCircle2, ScanFace } from 'lucide-react';
import BackupReminderBanner from '@/components/ui/BackupReminderBanner';
import VaultBrandIcon from '@/components/ui/VaultBrandIcon';
import { useTheme } from '@/context/ThemeContext';
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
import {
  computePinVerifier,
  deriveAesKeyFromPin,
  newKdfParams,
  timingSafeEqualVerifierB64,
} from '@/lib/crypto/vaultCrypto';
import { resetVaultLocalOnly } from '@/lib/storage';
import { VaultDataProvider } from '@/context/VaultDataContext';
import { VaultPermissionsProvider } from '@/hooks/useVaultPermissions';
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
  const t = useTranslations('auth');
  const { theme } = useTheme();
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
      setError(t('pwdMin'));
      triggerShake();
      return;
    }
    if (pin !== confirmPin) {
      setError(t('pwdMismatch'));
      triggerShake();
      setConfirmPin('');
      return;
    }
    void (async () => {
      try {
        if (typeof crypto === 'undefined' || !crypto.subtle) {
          setError(t('secureContext'));
          triggerShake();
          return;
        }
        const params = newKdfParams();
        const key = await deriveAesKeyFromPin(pin, params);
        const verifier = await computePinVerifier(key);
        try {
          setStoredKdfParams(params);
          setStoredVerifier(verifier);
        } catch (storageErr) {
          const name = storageErr instanceof DOMException ? storageErr.name : '';
          if (name === 'QuotaExceededError' || (storageErr as Error)?.name === 'QuotaExceededError') {
            setError(t('storageFull'));
          } else {
            setError(t('storageSaveFailed'));
          }
          triggerShake();
          return;
        }
        setVaultKey(key);
        if (biometricAvailable && !biometricRegistered) {
          setBiometricSetupOffer(true);
        } else {
          unlockVault();
        }
      } catch (err) {
        console.error('[SecureVault] setup failed', err);
        const msg = err instanceof Error ? err.message.toLowerCase() : '';
        if (
          msg.includes('memory') ||
          msg.includes('wasm') ||
          msg.includes('allocation') ||
          msg.includes('out of memory')
        ) {
          setError(t('oom'));
        } else if (msg.includes('hash-wasm') || msg.includes('failed to fetch') || msg.includes('loading')) {
          setError(t('wasmLoadFailed'));
        } else {
          setError(t('createFailed'));
        }
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
      if (!(await timingSafeEqualVerifierB64(got, verifier))) throw new Error('bad_pin');
      setVaultKey(key);
      unlockVault();
    })().catch(() => {
      setError(t('incorrectPwd'));
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
        setLoginHint(t('identityVerifiedHint'));
        setPhase('login');
        setPin('');
        setTimeout(() => inputRef.current?.focus(), 100);
      } else {
        setError(t('bioFailed'));
        triggerShake();
      }
    } catch {
      setError(t('bioUnavailable'));
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
        setError(t('bioSetupLater'));
        unlockVault();
      }
    } catch {
      setError(t('bioSetupFailed'));
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
    const ok = window.confirm(t('resetConfirm'));
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
    return (
      <VaultDataProvider>
        <VaultPermissionsProvider>{children}</VaultPermissionsProvider>
      </VaultDataProvider>
    );
  }

  // Biometric setup offer screen (shown after password creation)
  if (biometricSetupOffer) {
    return (
      <div className="min-h-screen auth-bg flex items-center justify-center p-4 relative overflow-hidden">
        <div className="relative w-full max-w-sm auth-card animate-auth-in">
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-2xl bg-vault-elevated border border-border flex items-center justify-center">
                <Fingerprint size={36} className="text-vault-warm" />
              </div>
            </div>
            <h1 className="text-2xl font-800 text-vault-text tracking-tight">{t('enableBiometrics')}</h1>
            <p className="text-sm text-vault-muted mt-1 text-center">{t('biometricSetupSubtitle')}</p>
          </div>

          {/* Biometric type indicators */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 flex flex-col items-center gap-2 bg-vault-elevated border border-border rounded-2xl p-4">
              <Fingerprint size={24} className="text-vault-warm" />
              <span className="text-xs text-vault-muted text-center">{t('fingerprint')}</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2 bg-vault-elevated border border-border rounded-2xl p-4">
              <ScanFace size={24} className="text-vault-warm" />
              <span className="text-xs text-vault-muted text-center">{t('faceId')}</span>
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
            {biometricLoading ? t('settingUp') : t('enableBiometricLogin')}
          </button>

          <button
            onClick={skipBiometricSetup}
            className="w-full py-3 text-sm text-vault-muted hover:text-vault-warm transition-colors"
          >
            {t('skipForNow')}
          </button>

          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-vault-warm" />
            <p className="text-xs text-vault-faint">{t('offlineNote')}</p>
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
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[color:var(--color-border)] bg-vault-elevated">
              {success ? (
                <CheckCircle2 size={36} className="text-vault-warm animate-scale-in" />
              ) : (
                <VaultBrandIcon variant={theme} size={48} aria-label="SecureVault" />
              )}
            </div>
          </div>

          <h1 className="text-2xl font-800 text-vault-text tracking-tight">
            {success ? t('welcome') : phase === 'setup' ? t('createPassword') : t('unlockVault')}
          </h1>
          <p className="text-sm text-vault-muted mt-1 text-center">
            {success
              ? t('unlocking')
              : phase === 'setup'
                ? t('createPin')
                : t('enterPin')}
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
              className="w-full mb-5 flex flex-col items-center gap-2 bg-vault-elevated hover:bg-vault-panel border border-[color:var(--color-border)] rounded-2xl py-4 px-4 transition-all duration-200 group"
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-vault-panel border border-[color:var(--color-border)] flex items-center justify-center transition-all duration-200">
                  {biometricLoading ? (
                    <div className="w-6 h-6 border-2 border-vault-faint border-t-vault-warm rounded-full animate-spin" />
                  ) : (
                    <Fingerprint size={28} className="text-vault-warm transition-colors" />
                  )}
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-700 text-vault-text transition-colors">
                  {biometricLoading ? t('authenticating') : t('biometric')}
                </p>
                <p className="text-xs text-vault-muted mt-0.5">{t('fingerprintOrFace')}</p>
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
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-vault-faint font-600">{t('usePassword')}</span>
              <div className="flex-1 h-px bg-border" />
            </div>
          )}

        {/* Form */}
        {!success && (
          <form onSubmit={phase === 'setup' ? handleSetup : handleLogin} className="space-y-4">
            {/* Password field */}
            <div className="space-y-1.5">
              <label className="text-xs font-700 text-vault-muted uppercase tracking-widest">
                {phase === 'setup' ? t('newPasswordLabel') : t('passwordLabel')}
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
                  placeholder={t('enterPasswordPlaceholder')}
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
                  {t('confirmPasswordLabel')}
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPin}
                    onChange={(e) => {
                      setConfirmPin(e.target.value);
                      setError('');
                    }}
                    placeholder={t('confirmPasswordPlaceholder')}
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
              {phase === 'setup' ? t('createVaultPassword') : t('submitUnlock')}
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
            {t('forgotReset')}
          </button>
        )}

        {/* Biometric setup hint (login phase, available but not registered) */}
        {!success && phase === 'login' && biometricAvailable && !biometricRegistered && (
          <p className="mt-4 text-center text-xs text-vault-faint">
            {t('biometricTip')}
          </p>
        )}

        {/* Footer */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-vault-warm" />
          <p className="text-xs text-vault-faint">{t('offlineNote')}</p>
        </div>
      </div>
    </div>
  );
}
