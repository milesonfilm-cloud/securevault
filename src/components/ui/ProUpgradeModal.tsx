'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, ExternalLink, Infinity as InfinityIcon, Lock, X } from 'lucide-react';
import { Link } from '@/i18n/navigation';

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Category label that was blocked, e.g. "Passport" */
  blockedCategory?: string;
}

const HIGHLIGHTS = [
  'Unlimited documents in every category',
  'Photo attachments on documents',
  'Export vault as PDF or JSON',
  'Local OCR import from PDF and Word',
  'Audit log and priority support',
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
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-[61] mx-auto max-w-lg rounded-t-[28px] bg-white/80 pb-safe shadow-[0_-12px_48px_rgba(15,23,42,0.12)] backdrop-blur-2xl"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-black/15" />
            </div>

            <div className="px-4 pb-6 pt-2 sm:px-6 sm:pb-8">
              {/* Close */}
              <button
                type="button"
                onClick={onClose}
                className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-vault-muted transition-colors hover:bg-black/10"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Crown icon */}
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-[#9A3412] to-[#C2410C] shadow-[0_8px_24px_rgba(154,52,18,0.35)]">
                <Crown className="h-8 w-8 text-[#FDE68A]" strokeWidth={1.75} fill="currentColor" />
              </div>

              {/* Heading */}
              <h2 className="mt-4 text-center text-[20px] font-extrabold text-vault-text">
                Upgrade to Pro
              </h2>
              <p className="mt-1.5 text-center text-[13px] text-vault-muted">
                {blockedCategory
                  ? `You've reached the free limit for ${blockedCategory}. Pro unlocks unlimited documents in every category.`
                  : 'Unlock unlimited documents, backups, sharing, and more.'}
              </p>

              {/* Feature list */}
              <div className="mt-5 space-y-2.5">
                {HIGHLIGHTS.map((feat) => (
                  <div key={feat} className="flex items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-vault-warm/50">
                      <InfinityIcon className="h-3.5 w-3.5 text-[#9A3412]" strokeWidth={2.5} />
                    </div>
                    <p className="text-[13px] font-semibold text-vault-text">{feat}</p>
                  </div>
                ))}
              </div>

              {/* Price + CTA */}
              <div className="mt-6 rounded-[18px] bg-gradient-to-br from-[#9A3412] to-[#C2410C] p-5 text-white shadow-[0_8px_24px_rgba(154,52,18,0.3)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-white/70">
                      Strong Vault Pro
                    </p>
                    <p className="text-[24px] font-extrabold">
                      ₹199
                      <span className="text-[13px] font-semibold text-white/65"> / year</span>
                    </p>
                  </div>
                  <Lock className="h-8 w-8 text-white/30" />
                </div>
                <Link
                  href="/upgrade"
                  onClick={onClose}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 text-[14px] font-extrabold text-[#9A3412] shadow-[0_4px_16px_rgba(0,0,0,0.18)] transition-all active:scale-[0.98]"
                >
                  Upgrade to Pro — ₹199/year
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                </Link>
              </div>

              <p className="mt-4 text-center text-[11px] text-vault-faint">
                Payment is processed by Google Play. Pro unlocks only after a successful purchase.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
