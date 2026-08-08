'use client';

import React from 'react';
import { canUseFeature, type PlanLimits } from '@/lib/featureFlags';
import { Lock } from 'lucide-react';

interface Props {
  feature: keyof PlanLimits;
  requiredPlan?: 'Pro';
  description?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function UpgradeGate({
  feature,
  requiredPlan = 'Pro',
  description,
  children,
  fallback,
}: Props) {
  if (canUseFeature(feature)) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return (
    <div className="rounded-xl border border-border bg-vault-elevated px-4 py-3 opacity-80">
      <div className="flex items-start gap-2">
        <Lock size={14} className="mt-0.5 flex-shrink-0 text-vault-muted" />
        <div>
          <p className="text-xs font-700 text-vault-text">
            Available on <strong>{requiredPlan}</strong> plan
          </p>
          {description ? (
            <p className="mt-1 text-xs leading-relaxed text-vault-muted">{description}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
