'use client';

import React from 'react';
import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';
import {
  BadgeCheck,
  BookOpen,
  BriefcaseMedical,
  Building2,
  Car,
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
};

export function CategoryLucideIcon({
  name,
  size = 16,
  className,
  style,
}: {
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const Icon = CATEGORY_LUCIDE[name] ?? FileText;
  return <Icon size={size} className={className} style={style} aria-hidden />;
}
