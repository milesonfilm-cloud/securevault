'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  /** Rendered in the header row next to the close control (e.g. scan action). */
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  headerActions,
  children,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-3xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 animate-fade-in sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-vault-ink/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative flex w-full max-h-[min(92dvh,100%)] flex-col overflow-hidden rounded-t-[24px] pb-[env(safe-area-inset-bottom,0px)] neo-card shadow-vault animate-scale-in sm:max-h-[min(90dvh,100%)] sm:rounded-2xl sm:pb-0 ${sizeClasses[size]}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-start justify-between gap-3 border-b border-[color:var(--color-border)] p-4 sm:p-6">
          <div className="min-w-0 flex-1">
            <h2 id="modal-title" className="text-lg font-700 text-vault-text">
              {title}
            </h2>
            {subtitle && <p className="text-sm text-vault-muted mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {headerActions}
            <button
              onClick={onClose}
              className="p-1.5 rounded-[10px] hover:bg-black/5 text-vault-faint hover:text-vault-warm transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">{children}</div>
      </div>
    </div>
  );
}
