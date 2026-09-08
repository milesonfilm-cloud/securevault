'use client';

import React from 'react';
import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';
import {
  BadgeCheck,
  Banknote,
  BookOpen,
  BriefcaseMedical,
  Building2,
  Car,
  CircleDollarSign,
  CreditCard,
  File,
  FileText,
  Globe,
  IdCard,
  KeyRound,
  Landmark,
  RefreshCw,
  ScrollText,
  Shield,
  TrendingUp,
  User,
  Users,
  Wallet,
  Wrench,
} from 'lucide-react';

const CATEGORY_LUCIDE: Record<string, ComponentType<LucideProps>> = {
  KeyRound,
  CreditCard,
  Landmark,
  Wallet,
  Building2,
  Car,
  Users,
  BookOpen,
  IdCard,
  Shield,
  Globe,
  BriefcaseMedical,
  ScrollText,
  FileText,
  Wrench,
  User,
  RefreshCw,
  BadgeCheck,
  File,
  TrendingUp,
  Banknote,
  CircleDollarSign,
};

export function CategoryLucideIcon({
  name,
  size = 16,
  className,
  style,
  strokeWidth = 1.75,
}: {
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  strokeWidth?: number;
}) {
  const Icon = CATEGORY_LUCIDE[name] ?? FileText;
  return (
    <Icon
      size={size}
      className={className}
      style={style}
      strokeWidth={strokeWidth}
      fill="none"
      aria-hidden
    />
  );
}
