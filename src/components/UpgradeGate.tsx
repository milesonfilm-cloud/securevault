'use client';

import React from 'react';
import { canUseFeature, type PlanLimits } from '@/lib/featureFlags';
import { Lock } from 'lucide-react';

interface Props {
  feature: keyof PlanLimits;
  requiredPlan?: 'Pro';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function UpgradeGate({ feature, requiredPlan = 'Pro', children, fallback }: Props) {
  if (canUseFeature(feature)) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return (
    <div className="flex cursor-not-allowed items-center gap-2 rounded-xl border border-border bg-vault-elevated px-3 py-2 opacity-60">
      <Lock size={14} className="flex-shrink-0 text-vault-muted" />
      <p className="text-xs text-vault-muted">
        Available on <strong>{requiredPlan}</strong> plan
      </p>
    </div>
  );
}
