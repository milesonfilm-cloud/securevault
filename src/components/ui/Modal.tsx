'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
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
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-[#312C51]/85 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full ${sizeClasses[size]} neo-card rounded-2xl animate-scale-in overflow-hidden max-h-[90vh] flex flex-col shadow-vault`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-[rgba(255,255,255,0.07)] flex-shrink-0">
          <div>
            <h2 id="modal-title" className="text-lg font-700 text-white">
              {title}
            </h2>
            {subtitle && <p className="text-sm text-vault-muted mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[10px] hover:bg-white/10 text-vault-faint hover:text-vault-warm transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
