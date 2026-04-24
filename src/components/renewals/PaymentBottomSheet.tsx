'use client';

import React from 'react';
import {
  generateGPayLink,
  generatePhonePeLink,
  generateUPILink,
  type UPILinkParams,
} from '@/lib/upi/deepLinks';

interface PaymentBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  params: UPILinkParams | null;
}

export default function PaymentBottomSheet({ isOpen, onClose, params }: PaymentBottomSheetProps) {
  if (!isOpen || !params) return null;

  const upi = generateUPILink(params);
  const phonepe = generatePhonePeLink(params);
  const gpay = generateGPayLink(params);

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-border bg-vault-panel shadow-vault p-5 pb-safe animate-in slide-in-from-bottom duration-200">
        <p className="text-sm font-800 text-vault-text mb-1">Pay / Renew</p>
        <p className="text-xs text-vault-muted mb-4">
          Opens your UPI app with payee prefilled. Confirm amount in the app.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <a
            href={phonepe}
            className="rounded-xl border border-border bg-vault-elevated py-3 text-center text-sm font-700 text-vault-text hover:bg-vault-elevated/80"
          >
            PhonePe
          </a>
          <a
            href={gpay}
            className="rounded-xl border border-border bg-vault-elevated py-3 text-center text-sm font-700 text-vault-text hover:bg-vault-elevated/80"
          >
            Google Pay
          </a>
          <a
            href={upi}
            className="rounded-xl border border-border bg-vault-elevated py-3 text-center text-sm font-700 text-vault-text hover:bg-vault-elevated/80"
          >
            BHIM / UPI
          </a>
          <a
            href={upi}
            className="rounded-xl border border-vault-warm/40 bg-vault-warm/15 py-3 text-center text-sm font-700 text-vault-warm hover:bg-vault-warm/25"
          >
            Other UPI
          </a>
        </div>
        <button type="button" className="btn-secondary w-full mt-4" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
