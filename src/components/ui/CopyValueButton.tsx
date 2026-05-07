'use client';

import React, { useCallback, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type CopyValueButtonProps = {
  /** Text copied to the clipboard (trimmed empty = disabled / no-op). */
  value: string;
  className?: string;
  /** Smaller hit target in tight form rows */
  compact?: boolean;
};

export default function CopyValueButton({
  value,
  className,
  compact = false,
}: CopyValueButtonProps) {
  const t = useTranslations('common');
  const [showCheck, setShowCheck] = useState(false);

  const onCopy = useCallback(async () => {
    const v = (value ?? '').trim();
    if (!v) {
      toast.message(t('nothingToCopy'));
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      setShowCheck(true);
      toast.success(t('copied'));
      window.setTimeout(() => setShowCheck(false), 1400);
    } catch {
      toast.error(t('copyFailed'));
    }
  }, [value, t]);

  const empty = !(value ?? '').trim();
  const size = compact ? 14 : 16;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void onCopy();
      }}
      disabled={empty}
      title={t('copy')}
      aria-label={t('copy')}
      className={cn(
        'shrink-0 rounded-lg p-1.5 text-vault-faint transition-colors hover:bg-vault-elevated hover:text-vault-warm disabled:cursor-not-allowed disabled:opacity-40',
        compact && 'p-1',
        className
      )}
    >
      {showCheck ? (
        <Check size={size} className="text-vault-warm" strokeWidth={2} aria-hidden />
      ) : (
        <Copy size={size} strokeWidth={2} aria-hidden />
      )}
    </button>
  );
}
