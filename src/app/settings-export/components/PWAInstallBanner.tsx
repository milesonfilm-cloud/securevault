'use client';

import React, { useState, useEffect } from 'react';
import { Download, Smartphone, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallBanner() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, _setDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    checkInstalled();
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    setInstalling(true);
    try {
      await installPrompt.prompt();
      const result = await installPrompt.userChoice;
      if (result.outcome === 'accepted') {
        setIsInstalled(true);
        setInstallPrompt(null);
      }
    } finally {
      setInstalling(false);
    }
  };

  if (dismissed) return null;

  return (
    <div className="neo-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-vault-elevated border border-[rgba(255,255,255,0.07)] rounded-2xl flex items-center justify-center">
          <Smartphone size={20} className="text-vault-warm" />
        </div>
        <div>
          <h3 className="text-base font-700 text-white">Install SecureVault</h3>
          <p className="text-xs text-vault-faint">Add to home screen for offline access</p>
        </div>
      </div>

      {isInstalled ? (
        <div className="flex items-center gap-2 bg-vault-elevated border border-vault-warm/30 rounded-2xl px-4 py-3">
          <CheckCircle2 size={16} className="text-vault-warm flex-shrink-0" />
          <p className="text-sm text-white font-500">SecureVault is installed on this device</p>
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-4">
            {[
              'Works completely offline — no internet required',
              'Fast access from your home screen',
              'All data stays on your device',
            ].map((feature, i) => (
              <div key={`pwa-feature-${i}`} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-vault-warm/60 rounded-full flex-shrink-0" />
                <span className="text-xs text-vault-muted">{feature}</span>
              </div>
            ))}
          </div>

          {installPrompt ? (
            <button
              onClick={handleInstall}
              disabled={installing}
              className="neo-btn neo-btn-primary w-full justify-center flex items-center gap-2 rounded-2xl py-3.5 text-sm font-800 text-white transition-all duration-200 active:scale-95"
            >
              {installing ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Installing...
                </span>
              ) : (
                <>
                  <Download size={16} />
                  Install App
                </>
              )}
            </button>
          ) : (
            <div className="neo-inset rounded-2xl px-4 py-3 text-xs text-vault-muted text-center">
              To install: tap <strong>Share</strong> → <strong>Add to Home Screen</strong> in your
              browser menu
            </div>
          )}
        </>
      )}
    </div>
  );
}
