'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, ExternalLink, Infinity as InfinityIcon, Lock, X } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { PLAY_STORE_URL } from '@/lib/subscription';

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Category label that was blocked, e.g. "Passport" */
  blockedCategory?: string;
}

const HIGHLIGHTS = [
  'Unlimited documents in every category',
  'Google Drive encrypted backup',
  'Secure document sharing links',
  'AI-powered document scanning',
  'Export vault as PDF or JSON',
];

export default function ProUpgradeModal({
  isOpen,
  onClose,
  blockedCategory,
}: ProUpgradeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-[61] mx-auto max-w-lg rounded-t-[28px] bg-white pb-safe shadow-[0_-12px_48px_rgba(0,0,0,0.18)]"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-[#212121]/15" />
            </div>

            <div className="px-6 pb-8 pt-2">
              {/* Close */}
              <button
                type="button"
                onClick={onClose}
                className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-[#F6F5FA] text-[#212121]/50 transition-colors hover:bg-[#eeecf5]"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Crown icon */}
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-[#4338C9] to-[#7c3aed] shadow-[0_8px_24px_rgba(67,56,201,0.35)]">
                <Crown className="h-8 w-8 text-yellow-300" strokeWidth={2} />
              </div>

              {/* Heading */}
              <h2 className="mt-4 text-center text-[20px] font-extrabold text-[#212121]">
                Upgrade to Pro
              </h2>
              <p className="mt-1.5 text-center text-[13px] text-[#212121]/55">
                {blockedCategory
                  ? `You've reached the free limit for ${blockedCategory}. Pro unlocks unlimited documents in every category.`
                  : 'Unlock unlimited documents, backups, sharing, and more.'}
              </p>

              {/* Feature list */}
              <div className="mt-5 space-y-2.5">
                {HIGHLIGHTS.map((feat) => (
                  <div key={feat} className="flex items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#4338C9]/12">
                      <InfinityIcon className="h-3.5 w-3.5 text-[#4338C9]" strokeWidth={2.5} />
                    </div>
                    <p className="text-[13px] font-semibold text-[#212121]">{feat}</p>
                  </div>
                ))}
              </div>

              {/* Price + CTA */}
              <div className="mt-6 rounded-[18px] bg-gradient-to-br from-[#4338C9] to-[#7c3aed] p-5 text-white shadow-[0_8px_24px_rgba(67,56,201,0.3)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-white/70">
                      SecureVault Pro
                    </p>
                    <p className="text-[24px] font-extrabold">
                      ₹199
                      <span className="text-[13px] font-semibold text-white/65"> / year</span>
                    </p>
                  </div>
                  <Lock className="h-8 w-8 text-white/30" />
                </div>
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 text-[14px] font-extrabold text-[#4338C9] shadow-[0_4px_16px_rgba(0,0,0,0.18)] transition-all active:scale-[0.98]"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-[#4338C9]" aria-hidden>
                    <path d="M3.18 23.73c.3.17.64.22.98.14l11.65-11.65L12.48 9l-9.3 14.73zM20.5 10.02l-2.83-1.63-3.4 3.39 3.4 3.39 2.86-1.64A1.99 1.99 0 0020.5 10.02zM1.05 1.44a2 2 0 000 1.84l9.14 9.14 3.27-3.27L2.01.78a1.5 1.5 0 00-.96.66zM12.48 13.78l-9.3 9.31c.34.08.68.03.98-.15l11.65-11.65-3.33-3.51z" />
                  </svg>
                  Get Pro on Google Play
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                </a>
              </div>

              {/* Already purchased */}
              <p className="mt-4 text-center text-[11px] text-[#212121]/40">
                Already purchased?{' '}
                <Link
                  href="/upgrade"
                  onClick={onClose}
                  className="font-bold text-[#4338C9] underline decoration-[#4338C9]/30 underline-offset-2"
                >
                  Tap here to activate
                </Link>
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
