import React from 'react';
import { cn } from '@/lib/utils';

const TITLE_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-wellness-serif), Georgia, serif',
};

export interface VaultPageHeadingProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Extra centered lines (filters, hints) */
  meta?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  titleClassName?: string;
  className?: string;
}

/** Centered page title + details used across vault screens. */
export default function VaultPageHeading({
  eyebrow,
  title,
  description,
  meta,
  icon,
  actions,
  titleClassName = 'mt-0.5 text-[22px] leading-tight tracking-tight text-vault-text sm:text-[28px]',
  className,
}: VaultPageHeadingProps) {
  return (
    <div className={cn('mb-4 flex flex-col items-center text-center sm:mb-6', className)}>
      {icon ? <div className="mb-2 flex justify-center sm:mb-3">{icon}</div> : null}
      {eyebrow ? (
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-vault-muted">
          {eyebrow}
        </p>
      ) : null}
      <h1 className={cn(titleClassName)} style={TITLE_STYLE}>
        {title}
      </h1>
      {description ? (
        <p className="mt-1.5 max-w-md text-[13px] font-normal leading-relaxed text-vault-muted">
          {description}
        </p>
      ) : null}
      {meta ? (
        <div className="mt-2 w-full max-w-md space-y-1 text-[13px] text-vault-muted">{meta}</div>
      ) : null}
      {actions ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
