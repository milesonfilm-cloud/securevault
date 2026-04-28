import React from 'react';
import { cn } from '@/lib/utils';

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

/** Centered page title block used across vault app screens. */
export default function VaultPageHeading({
  eyebrow,
  title,
  description,
  meta,
  icon,
  actions,
  titleClassName = 'mt-0.5 text-[clamp(1.375rem,4.5vw+0.2rem,2rem)] sm:text-[32px] font-bold leading-tight tracking-tight text-vault-text',
  className,
}: VaultPageHeadingProps) {
  return (
    <div className={cn('mb-6 flex flex-col items-center text-center', className)}>
      {icon ? <div className="mb-3 flex justify-center">{icon}</div> : null}
      {eyebrow ? <p className="text-xs font-medium text-vault-faint">{eyebrow}</p> : null}
      <h1 className={cn(titleClassName)}>{title}</h1>
      {description ? (
        <p className="mt-2 max-w-2xl text-balance text-[13px] text-vault-muted">{description}</p>
      ) : null}
      {meta ? (
        <div className="mt-2 w-full max-w-2xl space-y-1 text-balance text-[13px] text-vault-muted">
          {meta}
        </div>
      ) : null}
      {actions ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
