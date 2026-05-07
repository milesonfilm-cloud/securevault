'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  Camera,
  Check,
  CheckCircle2,
  CloudUpload,
  Crown,
  Download,
  ExternalLink,
  HeadphonesIcon,
  Infinity as InfinityIcon,
  Scan,
  Share2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { useVaultData } from '@/context/VaultDataContext';
import { isPro, PRO_FEATURES, PLAY_STORE_URL } from '@/lib/subscription';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ReactNode> = {
  Infinity: <InfinityIcon size={20} />,
  CloudUpload: <CloudUpload size={20} />,
  Share2: <Share2 size={20} />,
  Download: <Download size={20} />,
  Camera: <Camera size={20} />,
  Scan: <Scan size={20} />,
  Bell: <Bell size={20} />,
  HeadphonesIcon: <HeadphonesIcon size={20} />,
};

const PASTEL_CARD_COLORS = [
  '#e8d5f7',
  '#d5eaf7',
  '#d5f7e8',
  '#f7f0d5',
  '#f7d5e8',
  '#d5d5f7',
  '#f7e8d5',
  '#d5f7f7',
];

export default function UpgradeContent() {
  const { vaultData, persistVaultData } = useVaultData();
  const pro = isPro(vaultData.settings);
  const [activating, setActivating] = useState(false);

  const handleActivatePro = async () => {
    setActivating(true);
    try {
      await persistVaultData({
        ...vaultData,
        settings: { ...vaultData.settings, plan: 'pro' },
      });
      toast.success('🎉 Pro activated! Enjoy unlimited access.');
    } finally {
      setActivating(false);
    }
  };

  const handleDowngradeFree = async () => {
    await persistVaultData({
      ...vaultData,
      settings: { ...vaultData.settings, plan: 'free' },
    });
    toast('Switched back to Free plan.');
  };

  return (
    <div className="font-urbanist min-h-full bg-[#F6F5FA] pb-12">
      {/* ── Hero — dark purple ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#4338C9] via-[#6d28d9] to-[#7c3aed] px-6 pb-10 pt-12 text-white">
        {/* Soft blobs */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

        <div className="relative mx-auto max-w-lg text-center">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] bg-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-sm"
          >
            <Crown className="h-8 w-8 text-yellow-300" strokeWidth={2} />
          </motion.div>

          {pro ? (
            <>
              <motion.div
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-1.5 rounded-full bg-yellow-400/25 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-yellow-200 ring-1 ring-yellow-400/40"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Active Subscription
              </motion.div>
              <h1 className="mt-3 text-[26px] font-extrabold leading-tight">
                You&rsquo;re on <span className="text-yellow-300">SecureVault Pro</span>
              </h1>
              <p className="mt-2 text-[14px] text-white/75">
                All premium features are unlocked. Thank you for supporting the app!
              </p>
            </>
          ) : (
            <>
              <motion.div
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white/80 ring-1 ring-white/30"
              >
                <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                Upgrade to Pro
              </motion.div>
              <h1 className="mt-3 text-[26px] font-extrabold leading-tight">
                Unlock the full <span className="text-yellow-300">SecureVault</span>
              </h1>
              <p className="mt-2 text-[14px] text-white/75">
                Everything you need to manage your family&rsquo;s documents — unlimited, secure, and
                always at hand.
              </p>
            </>
          )}
        </div>
      </div>

      {/* ── CTA card (sits cleanly below hero — no overlap) ── */}
      {!pro && (
        <div className="mx-auto mt-6 max-w-lg px-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 22 }}
            className="rounded-[24px] bg-white p-6 shadow-[0_16px_48px_rgba(67,56,201,0.18)]"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#4338C9]">
                  SecureVault Pro
                </p>
                <p className="mt-0.5 text-[22px] font-extrabold text-[#212121]">
                  ₹199<span className="text-[14px] font-semibold text-[#212121]/50"> / year</span>
                </p>
                <p className="text-[11px] text-[#212121]/45">One-time yearly subscription</p>
              </div>
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex shrink-0 items-center gap-2 rounded-full bg-[#4338C9] px-5 py-3 text-[13px] font-bold text-white shadow-[0_8px_24px_rgba(67,56,201,0.35)] transition-all active:scale-95"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white" aria-hidden>
                  <path d="M3.18 23.73c.3.17.64.22.98.14l11.65-11.65L12.48 9l-9.3 14.73zM20.5 10.02l-2.83-1.63-3.4 3.39 3.4 3.39 2.86-1.64A1.99 1.99 0 0020.5 10.02zM1.05 1.44a2 2 0 000 1.84l9.14 9.14 3.27-3.27L2.01.78a1.5 1.5 0 00-.96.66zM12.48 13.78l-9.3 9.31c.34.08.68.03.98-.15l11.65-11.65-3.33-3.51z" />
                </svg>
                Get Pro
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </a>
            </div>
            <p className="mt-4 text-center text-[11px] text-[#212121]/40">
              Purchase securely through Google Play Store
            </p>
          </motion.div>
        </div>
      )}

      {/* ── Pro activated state ── */}
      {pro && (
        <div className="mx-auto mt-6 max-w-lg px-4">
          <div className="rounded-[24px] bg-white p-6 shadow-[0_16px_48px_rgba(67,56,201,0.14)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#4338C9]/10">
                <Crown className="h-6 w-6 text-[#4338C9]" />
              </div>
              <div>
                <p className="font-bold text-[#212121]">Pro is Active</p>
                <p className="text-[12px] text-[#212121]/50">
                  All features unlocked via Google Play
                </p>
              </div>
              <CheckCircle2 className="ml-auto h-6 w-6 text-emerald-500" />
            </div>
          </div>
        </div>
      )}

      {/* ── Pro features grid ── */}
      <div className="mx-auto mt-8 max-w-lg px-4">
        <h2 className="mb-4 text-[17px] font-bold text-[#212121]">What&rsquo;s included in Pro</h2>
        <div className="grid grid-cols-2 gap-3">
          {PRO_FEATURES.map((feat, i) => (
            <motion.div
              key={feat.icon}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, type: 'spring', stiffness: 300, damping: 24 }}
              className="rounded-[18px] p-4 shadow-[0_4px_16px_rgba(33,33,33,0.06)]"
              style={{ background: PASTEL_CARD_COLORS[i % PASTEL_CARD_COLORS.length] }}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-white/70">
                <span className="text-[#4338C9]">{ICON_MAP[feat.icon]}</span>
              </div>
              <p className="mt-2.5 text-[13px] font-bold text-[#212121]">{feat.title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-[#212121]/60">{feat.body}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Free vs Pro comparison ── */}
      <div className="mx-auto mt-8 max-w-lg px-4">
        <h2 className="mb-4 text-[17px] font-bold text-[#212121]">Free vs Pro</h2>
        <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_4px_20px_rgba(33,33,33,0.08)]">
          {/* Header row */}
          <div className="grid grid-cols-3 border-b border-[#212121]/06 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#212121]/45">
              Feature
            </p>
            <p className="text-center text-[11px] font-bold uppercase tracking-[1.5px] text-[#212121]/45">
              Free
            </p>
            <p className="text-center text-[11px] font-extrabold uppercase tracking-[1.5px] text-[#4338C9]">
              Pro
            </p>
          </div>
          {[
            ['Documents per category', '1', 'Unlimited'],
            ['Family member profiles', '✓', '✓'],
            ['Expiry reminders', 'Basic', 'Smart'],
            ['Google Drive backup', '—', '✓'],
            ['Secure sharing links', '—', '✓'],
            ['Export vault (PDF/JSON)', '—', '✓'],
            ['Photo attachments', '—', '✓'],
            ['AI document scan', '—', '✓'],
            ['Priority support', '—', '✓'],
          ].map(([feat, free, proval], i) => (
            <div
              key={feat}
              className={cn(
                'grid grid-cols-3 items-center px-4 py-3',
                i % 2 === 1 ? 'bg-[#F6F5FA]' : ''
              )}
            >
              <p className="text-[12px] font-semibold text-[#212121]">{feat}</p>
              <p className="text-center text-[12px] text-[#212121]/50">{free}</p>
              <p
                className={cn(
                  'text-center text-[12px] font-bold',
                  proval === '—' ? 'text-[#212121]/30' : 'text-[#4338C9]'
                )}
              >
                {proval === '✓' ? <Check className="mx-auto h-4 w-4 text-emerald-500" /> : proval}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      {!pro && (
        <div className="mx-auto mt-8 max-w-lg px-4">
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-3 rounded-[18px] bg-[#4338C9] py-4 text-[15px] font-extrabold text-white shadow-[0_12px_32px_rgba(67,56,201,0.35)] transition-all active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" aria-hidden>
              <path d="M3.18 23.73c.3.17.64.22.98.14l11.65-11.65L12.48 9l-9.3 14.73zM20.5 10.02l-2.83-1.63-3.4 3.39 3.4 3.39 2.86-1.64A1.99 1.99 0 0020.5 10.02zM1.05 1.44a2 2 0 000 1.84l9.14 9.14 3.27-3.27L2.01.78a1.5 1.5 0 00-.96.66zM12.48 13.78l-9.3 9.31c.34.08.68.03.98-.15l11.65-11.65-3.33-3.51z" />
            </svg>
            Get SecureVault Pro on Google Play
            <ExternalLink className="h-4 w-4 opacity-70" />
          </a>
          <p className="mt-3 text-center text-[11px] text-[#212121]/40">
            Already purchased?{' '}
            <button
              type="button"
              disabled={activating}
              onClick={handleActivatePro}
              className="font-bold text-[#4338C9] underline decoration-[#4338C9]/30 underline-offset-2"
            >
              {activating ? 'Activating…' : 'Tap here to activate'}
            </button>
          </p>
        </div>
      )}

      {/* Downgrade link (for testing) */}
      {pro && (
        <div className="mx-auto mt-6 max-w-lg px-4 text-center">
          <button
            type="button"
            onClick={handleDowngradeFree}
            className="text-[11px] text-[#212121]/35 underline decoration-[#212121]/20 underline-offset-2"
          >
            Cancel subscription / switch to Free
          </button>
        </div>
      )}
    </div>
  );
}
