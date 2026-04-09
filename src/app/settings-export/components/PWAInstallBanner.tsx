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
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
          <Smartphone size={20} className="text-violet-500" />
        </div>
        <div>
          <h3 className="text-base font-700 text-slate-900">Install SecureVault</h3>
          <p className="text-xs text-slate-400">Add to home screen for offline access</p>
        </div>
      </div>

      {isInstalled ? (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
          <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
          <p className="text-sm text-emerald-700 font-500">
            SecureVault is installed on this device
          </p>
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
                <div className="w-1.5 h-1.5 bg-violet-400 rounded-full flex-shrink-0" />
                <span className="text-xs text-slate-600">{feature}</span>
              </div>
            ))}
          </div>

          {installPrompt ? (
            <button
              onClick={handleInstall}
              disabled={installing}
              className="btn-primary w-full justify-center"
              style={{ backgroundColor: '#7C3AED' }}
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
            <div className="bg-slate-50 rounded-xl px-4 py-3 text-xs text-slate-500 text-center">
              To install: tap <strong>Share</strong> → <strong>Add to Home Screen</strong> in your
              browser menu
            </div>
          )}
        </>
      )}
    </div>
  );
}
