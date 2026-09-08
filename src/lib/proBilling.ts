import { NativePurchases, PURCHASE_TYPE } from '@capgo/native-purchases';
import { isNativeApp } from '@/lib/platform';
import type { VaultSettings } from '@/lib/storage';

/**
 * Google Play / App Store product IDs.
 * Create matching products in Play Console before release:
 * Monetize → Products → In-app products (or Subscriptions).
 *
 * Override with NEXT_PUBLIC_PRO_PRODUCT_ID / NEXT_PUBLIC_PRO_BASE_PLAN_ID if needed.
 */
export const PRO_PRODUCT_ID =
  process.env.NEXT_PUBLIC_PRO_PRODUCT_ID?.trim() || 'strongvault_pro';

/** Base plan ID for Android subscriptions (ignored for one-time INAPP). */
export const PRO_BASE_PLAN_ID =
  process.env.NEXT_PUBLIC_PRO_BASE_PLAN_ID?.trim() || 'yearly';

/** Prefer subscription; set NEXT_PUBLIC_PRO_PRODUCT_TYPE=inapp for a one-time product. */
export const PRO_PRODUCT_TYPE: PURCHASE_TYPE =
  process.env.NEXT_PUBLIC_PRO_PRODUCT_TYPE?.toLowerCase() === 'inapp'
    ? PURCHASE_TYPE.INAPP
    : PURCHASE_TYPE.SUBS;

export type ProEntitlement = {
  transactionId: string;
  productId: string;
  purchasedAt: string;
};

export type PurchaseProResult =
  | { ok: true; entitlement: ProEntitlement }
  | {
      ok: false;
      reason:
        | 'web_only'
        | 'billing_unsupported'
        | 'invalid_transaction'
        | 'cancelled'
        | 'failed';
      message?: string;
    };

function isValidTransactionId(id: string | undefined | null): id is string {
  if (!id || typeof id !== 'string') return false;
  const trimmed = id.trim();
  // Web plugin mock returns the literal "transactionId"
  if (!trimmed || trimmed === 'transactionId') return false;
  return true;
}

/** Pro is active only with a real store transaction — never from a free UI click. */
export function hasPaidProEntitlement(settings: VaultSettings): boolean {
  if ((settings.plan ?? 'free') !== 'pro') return false;
  return isValidTransactionId(settings.proEntitlement?.transactionId);
}

export async function purchasePro(): Promise<PurchaseProResult> {
  if (!isNativeApp()) {
    return { ok: false, reason: 'web_only' };
  }

  try {
    const { isBillingSupported } = await NativePurchases.isBillingSupported();
    if (!isBillingSupported) {
      return { ok: false, reason: 'billing_unsupported' };
    }

    const tx = await NativePurchases.purchaseProduct({
      productIdentifier: PRO_PRODUCT_ID,
      ...(PRO_PRODUCT_TYPE === PURCHASE_TYPE.SUBS
        ? { planIdentifier: PRO_BASE_PLAN_ID, productType: PURCHASE_TYPE.SUBS }
        : { productType: PURCHASE_TYPE.INAPP }),
    });

    if (!isValidTransactionId(tx.transactionId)) {
      return { ok: false, reason: 'invalid_transaction' };
    }

    return {
      ok: true,
      entitlement: {
        transactionId: tx.transactionId,
        productId: PRO_PRODUCT_ID,
        purchasedAt: new Date().toISOString(),
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err ?? '');
    const lower = message.toLowerCase();
    if (
      lower.includes('cancel') ||
      lower.includes('user_canceled') ||
      lower.includes('user cancelled') ||
      lower.includes('billingresponsecode: 1')
    ) {
      return { ok: false, reason: 'cancelled', message };
    }
    return { ok: false, reason: 'failed', message };
  }
}

/**
 * Ask Play Billing to re-process owned purchases.
 * Does not unlock Pro by itself — call {@link purchasePro} afterward if needed
 * (Play often restores / reports already-owned without charging again).
 */
export async function restoreProPurchases(): Promise<{ ok: boolean; message?: string }> {
  if (!isNativeApp()) {
    return { ok: false, message: 'web_only' };
  }
  try {
    await NativePurchases.restorePurchases();
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : String(err ?? ''),
    };
  }
}

export async function fetchProProductPrice(): Promise<string | null> {
  if (!isNativeApp()) return null;
  try {
    const { isBillingSupported } = await NativePurchases.isBillingSupported();
    if (!isBillingSupported) return null;
    const { product } = await NativePurchases.getProduct({
      productIdentifier: PRO_PRODUCT_ID,
      productType: PRO_PRODUCT_TYPE,
    });
    return product?.priceString ?? null;
  } catch {
    return null;
  }
}
