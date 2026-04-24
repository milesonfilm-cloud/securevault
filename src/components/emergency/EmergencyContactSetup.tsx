'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import type { EmergencyContact } from '@/lib/storage';
import { useVaultData } from '@/context/VaultDataContext';
import { checkIn, isTimerExpired, msUntilDeadline } from '@/lib/emergency/deadManSwitch';

const DAYS_OPTIONS = [7, 14, 30] as const;

export default function EmergencyContactSetup() {
  const { vaultData, persistVaultData } = useVaultData();
  const existing = vaultData.emergencyContact;
  const [name, setName] = useState(existing?.name ?? '');
  const [email, setEmail] = useState(existing?.email ?? '');
  const [days, setDays] = useState<7 | 14 | 30>(existing?.inactivityDays ?? 14);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!name.trim() || !email.trim() || !email.includes('@')) {
      toast.error('Enter a valid name and email');
      return;
    }
    const contact: EmergencyContact = {
      name: name.trim(),
      email: email.trim(),
      inactivityDays: days,
      lastCheckInAt: existing?.lastCheckInAt ?? new Date().toISOString(),
    };
    await persistVaultData({ ...vaultData, emergencyContact: contact });
    toast.success('Emergency contact saved');
  };

  const doCheckIn = async () => {
    if (!existing) {
      toast.error('Save a contact first');
      return;
    }
    const next = checkIn(existing);
    await persistVaultData({ ...vaultData, emergencyContact: next });
    toast.success('Check-in recorded — timer reset');
  };

  const sendTestNotify = async () => {
    if (!existing?.email) {
      toast.error('Save a contact first');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/emergency/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: existing.email,
          name: existing.name,
          subject: 'SecureVault — test emergency notice',
          message:
            'This is a test notification from SecureVault. No action is required. If you received this, email delivery is working.',
        }),
      });
      if (!res.ok) throw new Error('notify_failed');
      const j = (await res.json()) as { dev?: boolean };
      toast.success(j.dev ? 'Logged in dev mode (configure RESEND_API_KEY to send email)' : 'Email sent');
    } catch {
      toast.error('Could not send test email');
    } finally {
      setBusy(false);
    }
  };

  const expired = isTimerExpired(existing);
  const ms = msUntilDeadline(existing);

  return (
    <div className="neo-card rounded-2xl p-6 space-y-4">
      <div>
        <h3 className="text-sm font-800 text-vault-text">Trusted emergency contact</h3>
        <p className="text-xs text-vault-muted mt-1">
          If you stop opening the app for longer than the inactivity window, notify your contact
          (MVP: use Test email; production: configure Resend).
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-[11px] font-700 text-vault-faint uppercase">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-vault-elevated px-3 py-2 text-sm text-vault-text"
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-700 text-vault-faint uppercase">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-vault-elevated px-3 py-2 text-sm text-vault-text"
          />
        </label>
      </div>

      <div>
        <span className="text-[11px] font-700 text-vault-faint uppercase">Inactivity before alert</span>
        <div className="flex flex-wrap gap-2 mt-2">
          {DAYS_OPTIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={`rounded-xl px-3 py-2 text-xs font-700 border ${
                days === d
                  ? 'border-vault-warm bg-vault-warm/15 text-vault-text'
                  : 'border-border text-vault-muted'
              }`}
            >
              {d} days
            </button>
          ))}
        </div>
      </div>

      {existing && (
        <div className="rounded-xl border border-border bg-vault-elevated/40 px-4 py-3 text-xs">
          <p className={expired ? 'text-red-300 font-700' : 'text-vault-muted'}>
            {expired
              ? 'Inactivity window elapsed — send notice from your recovery workflow.'
              : ms != null
                ? `Next deadline in approximately ${Math.max(0, Math.round(ms / 86400000))} day(s).`
                : 'Timer active.'}
          </p>
          <p className="text-vault-faint mt-1">
            Last check-in:{' '}
            {existing.lastCheckInAt
              ? new Date(existing.lastCheckInAt).toLocaleString()
              : 'Never'}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-primary text-sm py-2 px-4" onClick={() => void save()}>
          Save contact
        </button>
        <button type="button" className="btn-secondary text-sm py-2 px-4" onClick={() => void doCheckIn()}>
          Check in now
        </button>
        <button
          type="button"
          className="btn-secondary text-sm py-2 px-4"
          onClick={() => void sendTestNotify()}
          disabled={busy}
        >
          Test email
        </button>
      </div>
    </div>
  );
}
