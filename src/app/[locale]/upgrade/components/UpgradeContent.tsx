'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  Camera,
  Check,
  CheckCircle2,
  CloudUpload,
  Crown,
  Download,
  HeadphonesIcon,
  Infinity as InfinityIcon,
  Scan,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useVaultData } from '@/context/VaultDataContext';
import { isPro, PRO_FEATURES, PLAY_STORE_URL } from '@/lib/subscription';
import {
  fetchProProductPrice,
  purchasePro,
  restoreProPurchases,
} from '@/lib/proBilling';
import { isNativeApp } from '@/lib/platform';
import { cn } from '@/lib/utils';
import VaultPageHeading from '@/components/ui/VaultPageHeading';

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
  '#F6F5FA',
  '#EEF1F6',
  '#F3F6F0',
  '#F4F3F8',
  '#EEF3F6',
  '#F5F4F0',
  '#F0F2F7',
  '#F6F5FA',
];

const COMPARE_ORDER = [
  'docsPerCat',
  'familyProfiles',
  'expiryReminders',
  'exportVault',
  'photos',
  'support',
] as const;

export default function UpgradeContent() {
  const t = useTranslations('upgrade');
  const { vaultData, persistVaultData } = useVaultData();
  const pro = isPro(vaultData.settings);
  const [busy, setBusy] = useState(false);
  const [storePrice, setStorePrice] = useState<string | null>(null);
  const native = isNativeApp();

  useEffect(() => {
    let cancelled = false;
    void fetchProProductPrice().then((price) => {
      if (!cancelled && price) setStorePrice(price);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePurchasePro = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await purchasePro();
      if (result.ok) {
        await persistVaultData({
          ...vaultData,
          settings: {
            ...vaultData.settings,
            plan: 'pro',
            proEntitlement: result.entitlement,
          },
        });
        toast.success(t('toastActivated'));
        return;
      }

      switch (result.reason) {
        case 'web_only':
          toast.message(t('purchasePlayOnly'), {
            description: t('purchasePlayOnlyHint'),
            action: {
              label: t('openPlayStore'),
              onClick: () => window.open(PLAY_STORE_URL, '_blank', 'noopener,noreferrer'),
            },
          });
          break;
        case 'billing_unsupported':
          toast.error(t('billingUnsupported'));
          break;
        case 'cancelled':
          toast.message(t('purchaseCancelled'));
          break;
        case 'invalid_transaction':
          toast.error(t('purchaseInvalid'));
          break;
        default:
          toast.error(t('purchaseFailed'), {
            description: result.message || t('purchaseFailedHint'),
          });
      }
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (!native) {
        toast.message(t('purchasePlayOnly'), { description: t('purchasePlayOnlyHint') });
        return;
      }
      const restored = await restoreProPurchases();
      if (!restored.ok) {
        toast.error(t('restoreFailed'), { description: restored.message });
        return;
      }
      // After Play restores ownership, re-run purchase flow — Play will not
      // charge again for an already-owned subscription / product.
      const result = await purchasePro();
      if (result.ok) {
        await persistVaultData({
          ...vaultData,
          settings: {
            ...vaultData.settings,
            plan: 'pro',
            proEntitlement: result.entitlement,
          },
        });
        toast.success(t('toastRestored'));
        return;
      }
      if (result.reason === 'cancelled') {
        toast.message(t('restoreNoPurchase'));
        return;
      }
      toast.message(t('restoreNoPurchase'));
    } finally {
      setBusy(false);
    }
  };

  const priceLabel = storePrice ?? '₹199';

  return (
    <div className="vault-page font-urbanist">
      <VaultPageHeading
        icon={<Crown className="h-8 w-8 text-[#D4A017]" strokeWidth={1.75} fill="currentColor" />}
        title={
          pro ? (
            <>
              {t('heroOnProLead')} <span className="text-[#C9A227]">{t('planName')}</span>
            </>
          ) : (
            <>
              {t('heroUnlockLead')} <span className="text-[#C9A227]">{t('brandShort')}</span>
            </>
          )
        }
        description={pro ? t('heroOnProSub') : t('heroUnlockSub')}
      />

      {!pro && (
        <div className="mt-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 22 }}
            className="rounded-[24px] bg-white p-6 shadow-[0_8px_28px_rgba(33,33,33,0.06)]"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[1.5px] text-vault-muted">
                  {t('planName')}
                </p>
                <p className="mt-0.5 text-[22px] font-extrabold text-[#212121]">
                  {priceLabel}
                  {!storePrice ? (
                    <span className="text-[14px] font-semibold text-[#212121]/50">
                      {t('pricePerYear')}
                    </span>
                  ) : null}
                </p>
                <p className="text-[11px] text-[#212121]/45">{t('subscriptionNote')}</p>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => void handlePurchasePro()}
                className="flex shrink-0 items-center gap-2 rounded-full bg-vault-text px-5 py-3 text-[13px] font-bold text-white shadow-[0_8px_24px_rgba(33,33,33,0.12)] transition-all active:scale-95 disabled:opacity-60"
              >
                {busy ? t('activating') : t('getProCta')}
              </button>
            </div>
            <p className="mt-4 text-center text-[11px] text-[#212121]/40">{t('purchaseNote')}</p>
          </motion.div>
        </div>
      )}

      {pro && (
        <div className="mt-6">
          <div className="rounded-[24px] bg-white p-6 shadow-[0_8px_28px_rgba(33,33,33,0.06)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-black/[0.04]">
                <Crown className="h-6 w-6 text-[#D4A017]" fill="currentColor" strokeWidth={1.75} />
              </div>
              <div>
                <p className="font-bold text-[#212121]">{t('proIsActive')}</p>
                <p className="text-[12px] text-[#212121]/50">{t('proActiveSub')}</p>
              </div>
              <CheckCircle2 className="ml-auto h-6 w-6 text-emerald-500" />
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="mb-4 text-[17px] font-bold text-[#212121]">{t('whatsIncluded')}</h2>
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
                <span className="text-vault-muted">{ICON_MAP[feat.icon]}</span>
              </div>
              <p className="mt-2.5 text-[13px] font-bold text-[#212121]">
                {t(`features.${feat.icon}.title` as Parameters<typeof t>[0])}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-[#212121]/60">
                {t(`features.${feat.icon}.body` as Parameters<typeof t>[0])}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-[17px] font-bold text-[#212121]">{t('freeVsPro')}</h2>
        <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_4px_20px_rgba(33,33,33,0.08)]">
          <div className="grid grid-cols-3 border-b border-[#212121]/06 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#212121]/45">
              {t('tableFeature')}
            </p>
            <p className="text-center text-[11px] font-bold uppercase tracking-[1.5px] text-[#212121]/45">
              {t('tableFree')}
            </p>
            <p className="text-center text-[11px] font-extrabold uppercase tracking-[1.5px] text-vault-text">
              {t('tablePro')}
            </p>
          </div>
          {COMPARE_ORDER.map((rowKey, i) => {
            const free = t(`compare.${rowKey}.free` as Parameters<typeof t>[0]);
            const proCell = t(`compare.${rowKey}.pro` as Parameters<typeof t>[0]);
            return (
              <div
                key={rowKey}
                className={cn(
                  'grid grid-cols-3 items-center px-4 py-3',
                  i % 2 === 1 ? 'bg-black/[0.025]' : ''
                )}
              >
                <p className="text-[12px] font-semibold text-[#212121]">
                  {t(`compare.${rowKey}.feature` as Parameters<typeof t>[0])}
                </p>
                <p className="text-center text-[12px] text-[#212121]/50">{free}</p>
                <p
                  className={cn(
                    'text-center text-[12px] font-bold',
                    proCell === '—' ? 'text-[#212121]/30' : 'text-vault-text'
                  )}
                >
                  {proCell === '✓' ? (
                    <Check className="mx-auto h-4 w-4 text-emerald-500" />
                  ) : (
                    proCell
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {!pro && (
        <div className="mt-8">
          <button
            type="button"
            disabled={busy}
            onClick={() => void handlePurchasePro()}
            className="flex w-full items-center justify-center gap-3 rounded-[18px] bg-vault-text py-4 text-[15px] font-extrabold text-white shadow-[0_10px_28px_rgba(33,33,33,0.12)] transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {busy ? t('activating') : t('getProPlayCta')}
          </button>
          <p className="mt-3 text-center text-[11px] text-[#212121]/40">
            {t('alreadyPurchased')}{' '}
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleRestore()}
              className="font-bold text-vault-text underline decoration-black/25 underline-offset-2 disabled:opacity-60"
            >
              {busy ? t('activating') : t('restorePurchases')}
            </button>
          </p>
        </div>
      )}

      {pro && (
        <div className="mt-6 text-center">
          <a
            href="https://play.google.com/store/account/subscriptions"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-[#212121]/35 underline decoration-[#212121]/20 underline-offset-2"
          >
            {t('manageSubscription')}
          </a>
        </div>
      )}
    </div>
  );
}
