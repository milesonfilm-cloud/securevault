'use client';

import { LayoutGrid } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export type MembersViewLayout = 'carousel' | 'grid';

export default function MembersViewModeToggle({
  value,
  onChange,
}: {
  value: MembersViewLayout;
  onChange: (v: MembersViewLayout) => void;
}) {
  const t = useTranslations('familyManagement');
  const isCarousel = value === 'carousel';

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-vault-elevated/45 py-1 pl-3 pr-1 sm:gap-2.5 sm:pl-4">
      <span
        className={cn(
          'text-[11px] font-semibold sm:text-xs',
          isCarousel ? 'text-vault-text' : 'text-vault-faint'
        )}
      >
        {t('viewCarousel')}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={!isCarousel}
        aria-label={isCarousel ? t('switchToGrid') : t('switchToCarousel')}
        onClick={() => onChange(isCarousel ? 'grid' : 'carousel')}
        className="relative h-8 w-[3.25rem] shrink-0 rounded-full bg-vault-panel shadow-[inset_0_1px_3px_rgba(0,0,0,0.35)] ring-1 ring-white/10"
      >
        <span
          className={cn(
            'absolute top-1 z-10 h-6 w-6 rounded-full bg-vault-warm shadow-md transition-all duration-200 ease-out',
            isCarousel ? 'left-1 right-auto' : 'left-auto right-1'
          )}
        />
        <LayoutGrid
          className="pointer-events-none absolute right-1.5 top-1/2 z-0 h-3 w-3 -translate-y-1/2 text-vault-faint/55"
          strokeWidth={2}
          aria-hidden
        />
      </button>
      <span
        className={cn(
          'pr-2 text-[11px] font-semibold sm:text-xs',
          !isCarousel ? 'text-vault-text' : 'text-vault-faint'
        )}
      >
        {t('viewGrid')}
      </span>
    </div>
  );
}
