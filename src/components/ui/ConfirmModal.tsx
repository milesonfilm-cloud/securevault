'use client';

import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  isDanger?: boolean;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  isDanger = false,
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="sm">
      <div className="p-6 text-center">
        <div
          className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDanger ? 'bg-red-50' : 'bg-amber-50'}`}
        >
          <AlertTriangle size={24} className={isDanger ? 'text-red-500' : 'text-amber-500'} />
        </div>
        <h3 className="text-lg font-700 text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 mb-6">{description}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="btn-secondary" disabled={isLoading}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`${isDanger ? 'btn-danger' : 'btn-primary'} min-w-[100px] justify-center`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Working...
              </span>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
