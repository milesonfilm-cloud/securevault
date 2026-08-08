'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

const CONSENT_KEY = 'sv_consent_v1';

export interface ConsentPreferences {
  analytics: boolean;
  /** Legacy field; always false — vault data stays on device. */
  aiProcessing: boolean;
  acceptedAt: string;
}

export function getStoredConsent(): ConsentPreferences | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return raw ? (JSON.parse(raw) as ConsentPreferences) : null;
  } catch {
    return null;
  }
}

export function storeConsent(prefs: Omit<ConsentPreferences, 'acceptedAt'>) {
  const full: ConsentPreferences = {
    analytics: prefs.analytics,
    aiProcessing: false,
    acceptedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(full));
  } catch {
    /* ignore */
  }
  return full;
}

export default function ConsentBanner() {
  const t = useTranslations('consentBanner');
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const existing = getStoredConsent();
    if (!existing) setVisible(true);
  }, []);

  const accept = () => {
    // Local-only app: never enable analytics (or any networked processing).
    storeConsent({ analytics: false, aiProcessing: false });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('ariaLabel')}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: '16px',
        background: 'var(--color-background-primary)',
        borderTop: '0.5px solid var(--color-border-tertiary)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
      }}
    >
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 12,
          }}
        >
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>{t('title')}</p>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
              {t.rich('body', {
                device: (chunks) => <strong>{chunks}</strong>,
              })}
            </p>

            {showDetails && (
              <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked
                    readOnly
                    disabled
                    style={{ width: 16, height: 16 }}
                  />
                  <span>
                    {t.rich('essential', {
                      strong: (chunks) => <strong>{chunks}</strong>,
                    })}
                  </span>
                </label>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => accept()}
                style={{
                  padding: '8px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#3B6D11',
                  color: '#fff',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                {showDetails ? t('savePreferences') : t('acceptAll')}
              </button>
              {!showDetails && (
                <button
                  type="button"
                  onClick={() => accept()}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '0.5px solid var(--color-border-tertiary)',
                    background: 'transparent',
                    fontSize: 13,
                    cursor: 'pointer',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {t('essentialOnly')}
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '0.5px solid var(--color-border-tertiary)',
                  background: 'transparent',
                  fontSize: 13,
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {showDetails ? t('hideDetails') : t('managePreferences')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
