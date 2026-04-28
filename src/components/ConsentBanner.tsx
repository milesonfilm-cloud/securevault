'use client';

import React, { useState, useEffect } from 'react';

const CONSENT_KEY = 'sv_consent_v1';

export interface ConsentPreferences {
  analytics: boolean;
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
  const full: ConsentPreferences = { ...prefs, acceptedAt: new Date().toISOString() };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(full));
  } catch {
    /* ignore */
  }
  return full;
}

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(true);

  useEffect(() => {
    const existing = getStoredConsent();
    if (!existing) setVisible(true);
  }, []);

  const accept = (analyticsChoice: boolean, aiChoice: boolean) => {
    storeConsent({ analytics: analyticsChoice, aiProcessing: aiChoice });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Privacy preferences"
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
            <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>
              Privacy & data preferences
            </p>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
              SecureVault stores all your documents <strong>encrypted on your device</strong>. When
              you use AI document scan, OCR text is sent to Anthropic for processing. Analytics help
              us improve the app. You can change these choices anytime in Settings.
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
                    <strong>Essential</strong> — Local encrypted storage, auth, offline
                    functionality (required)
                  </span>
                </label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={aiProcessing}
                    onChange={(e) => setAiProcessing(e.target.checked)}
                    style={{ width: 16, height: 16 }}
                  />
                  <span>
                    <strong>AI processing</strong> — OCR text sent to Anthropic Claude for document
                    field extraction. No document images leave your device.
                  </span>
                </label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    style={{ width: 16, height: 16 }}
                  />
                  <span>
                    <strong>Analytics</strong> — Anonymous usage statistics via Google Analytics to
                    improve the app.
                  </span>
                </label>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => accept(analytics, aiProcessing)}
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
                {showDetails ? 'Save preferences' : 'Accept all'}
              </button>
              {!showDetails && (
                <button
                  type="button"
                  onClick={() => accept(false, false)}
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
                  Essential only
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
                {showDetails ? 'Hide details' : 'Manage preferences'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
