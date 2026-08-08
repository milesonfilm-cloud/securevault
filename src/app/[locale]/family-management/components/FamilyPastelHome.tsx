'use client';

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  ChevronRight,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  StickyNote,
  X,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { FamilyMember, Document } from '@/lib/storage';
import { CATEGORIES, getCategoryById } from '@/lib/categories';
import Modal from '@/components/ui/Modal';
import CopyValueButton from '@/components/ui/CopyValueButton';
import { CategoryLucideIcon } from '@/lib/categoryLucideIcons';
import {
  pastelPaletteFromAvatarColor,
  PASTEL_ACCENT_PLACEHOLDER_PALETTE,
} from '@/lib/memberPastelPalettes';
import { isDemoMemberId } from '@/lib/demoFamilyMembers';
import { isDemoMode } from '@/lib/demoMode';
import { resolveMemberColor } from '@/lib/memberAvatarColors';
import MemberAvatar from '@/components/MemberAvatar';
import { cn } from '@/lib/utils';
import { useVaultData } from '@/context/VaultDataContext';
import { usePastelMemberAccent } from '@/context/PastelMemberAccentContext';
import {
  DEFAULT_EXPIRY_WARN_DAYS,
  getDocumentExpiryUrgency,
  formatExpirySummary,
  parseExpiryValue,
  EXPIRY_FIELD_KEYS,
} from '@/lib/documentExpiry';

const SPRING = [0.16, 1, 0.3, 1] as const;

/** Landscape card + stacked layers: each rear card exposes this many px above the one in front */
const PASTEL_CARD_STACK_PEEK_PX = 30;
const PASTEL_CARD_H = 292;
const PASTEL_CARD_MAX_W = 384;

function formatMonthYear(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

function pastelRipple(e: React.MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  if (getComputedStyle(el).position === 'static') {
    el.style.position = 'relative';
  }
  el.style.overflow = 'hidden';
  const rect = el.getBoundingClientRect();
  const dot = document.createElement('span');
  dot.className = 'pastel-ripple-dot';
  dot.style.left = `${e.clientX - rect.left}px`;
  dot.style.top = `${e.clientY - rect.top}px`;
  el.appendChild(dot);
  window.setTimeout(() => dot.remove(), 720);
}

function usePastelCountUp(target: number, enabled: boolean) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let intervalId: number | undefined;
    const startTimer = window.setTimeout(() => {
      if (cancelled) return;
      const dur = 500;
      const stepMs = 16;
      const steps = Math.max(1, Math.ceil(dur / stepMs));
      let i = 0;
      intervalId = window.setInterval(() => {
        i += 1;
        setV(Math.round((target * i) / steps));
        if (i >= steps) {
          if (intervalId !== undefined) window.clearInterval(intervalId);
          intervalId = undefined;
          setV(target);
        }
      }, stepMs) as unknown as number;
    }, 700);
    return () => {
      cancelled = true;
      window.clearTimeout(startTimer);
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, [target, enabled]);
  return v;
}

// ─── Member Category Section ───────────────────────────────────────────────
type MemberPaletteType = ReturnType<typeof pastelPaletteFromAvatarColor>;

function maskValue(v: string) {
  return '•'.repeat(Math.min(v.length, 12));
}

/** Inline document detail — mirrors the document vault expanded card */
function InlineDocDetail({
  doc,
  catColor,
  catIcon,
  catLabel,
  onBack,
}: {
  doc: Document;
  catColor: string;
  catIcon: string;
  catLabel: string;
  onBack: () => void;
}) {
  const t = useTranslations('pastelHome');
  const locale = useLocale();
  const [revealedFields, setRevealedFields] = useState<Set<string>>(new Set());
  const urgency = getDocumentExpiryUrgency(doc, DEFAULT_EXPIRY_WARN_DAYS);
  const catConfig = getCategoryById(doc.categoryId);

  const expiryBanner = useMemo(() => {
    for (const key of EXPIRY_FIELD_KEYS) {
      const raw = doc.fields[key];
      if (!raw?.trim()) continue;
      const exp = parseExpiryValue(raw);
      if (!exp) continue;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const daysUntil = Math.round((exp.getTime() - today.getTime()) / 86400000);
      if (daysUntil <= DEFAULT_EXPIRY_WARN_DAYS) {
        return { label: key, summary: formatExpirySummary(daysUntil, exp), daysUntil };
      }
    }
    return null;
  }, [doc]);

  const fieldEntries = Object.entries(doc.fields).filter(([, v]) => v?.trim());

  const toggleReveal = (key: string) =>
    setRevealedFields((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <motion.div
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 28 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col"
    >
      {/* ── Header ── */}
      <div
        className="flex items-center gap-2.5 px-4 py-3"
        style={{ borderBottom: `1.5px solid ${catColor}22` }}
      >
        <button
          type="button"
          onClick={onBack}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F6F5FA] transition-colors active:bg-[#eeecf5]"
        >
          <ArrowLeft className="h-4 w-4 text-[#212121]/60" />
        </button>
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px]"
          style={{ background: `${catColor}1e` }}
        >
          <CategoryLucideIcon name={catIcon} size={17} style={{ color: catColor }} />
        </div>
        <div className="min-w-0 flex-1">
          {/* category label */}
          <p
            className="text-[10px] font-bold uppercase tracking-[1.5px] leading-none"
            style={{ color: catColor }}
          >
            {catLabel}
          </p>
          {/* title + copy */}
          <div className="mt-0.5 flex items-center gap-1.5">
            <p className="min-w-0 truncate text-[14px] font-bold text-[#212121]">{doc.title}</p>
            <CopyValueButton value={doc.title} compact />
          </div>
        </div>
        {/* expiry/urgency badges */}
        {urgency === 'expired' && (
          <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-red-500 ring-1 ring-red-200">
            {t('badgeExpired')}
          </span>
        )}
        {urgency === 'soon' && (
          <span className="shrink-0 rounded-full bg-orange-50 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-orange-500 ring-1 ring-orange-200">
            {t('badgeExpiring')}
          </span>
        )}
      </div>

      {/* ── Expiry alert banner ── */}
      {urgency && expiryBanner && (
        <div
          className="mx-4 mt-3 flex items-start gap-2.5 rounded-[12px] px-3 py-2.5"
          style={{
            background: urgency === 'expired' ? 'rgba(239,68,68,0.07)' : 'rgba(249,115,22,0.07)',
            border: `1px solid ${urgency === 'expired' ? 'rgba(239,68,68,0.2)' : 'rgba(249,115,22,0.2)'}`,
          }}
        >
          <AlertTriangle
            className="mt-0.5 h-3.5 w-3.5 shrink-0"
            style={{ color: urgency === 'expired' ? '#ef4444' : '#f97316' }}
          />
          <div className="min-w-0 flex-1">
            <p
              className="text-[11px] font-bold"
              style={{ color: urgency === 'expired' ? '#ef4444' : '#ea580c' }}
            >
              {expiryBanner.summary}
            </p>
            <p className="text-[10px] text-[#212121]/50">{expiryBanner.label}</p>
          </div>
        </div>
      )}

      {/* ── Fields ── */}
      <div className="px-4 pb-4 pt-3">
        {fieldEntries.length === 0 ? (
          <p className="py-3 text-center text-[12px] text-[#212121]/40">{t('noFieldsRecorded')}</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {fieldEntries.map(([key, value]) => {
              const catField = catConfig?.fields.find((f) => f.key === key);
              const isSensitive = catField?.sensitive ?? false;
              const isRevealed = revealedFields.has(key);
              const displayValue = isSensitive && !isRevealed ? maskValue(value) : value;

              return (
                <div
                  key={key}
                  className="rounded-[12px] px-3 py-2.5"
                  style={{
                    background: '#F6F5FA',
                    border: '1px solid rgba(33,33,33,0.07)',
                  }}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <p className="min-w-0 flex-1 truncate text-[10px] font-semibold uppercase tracking-[1px] text-[#212121]/50">
                      {key}
                    </p>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <CopyValueButton value={value} compact />
                      {isSensitive && (
                        <button
                          type="button"
                          onClick={() => toggleReveal(key)}
                          className="rounded-lg p-1 text-[#212121]/40 transition-colors hover:text-[#212121]/70"
                          title={isRevealed ? t('hideField') : t('revealField')}
                        >
                          {isRevealed ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-1 break-all text-[13px] font-bold text-[#212121]">
                    {displayValue}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Notes */}
        {doc.notes?.trim() ? (
          <div
            className="mt-2.5 rounded-[12px] px-3 py-2.5"
            style={{ background: '#F6F5FA', border: '1px solid rgba(33,33,33,0.07)' }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-start gap-2">
                <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#212121]/40" />
                <p className="min-w-0 text-[12px] leading-relaxed text-[#212121]/65">{doc.notes}</p>
              </div>
              <CopyValueButton value={doc.notes} compact />
            </div>
          </div>
        ) : null}

        {/* Tags */}
        {doc.tags.length > 0 && (
          <div className="mt-2.5">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#212121]/45">
                {t('tagsHeading')}
              </p>
              <CopyValueButton value={doc.tags.join(', ')} compact />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {doc.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{
                    background: `${catColor}15`,
                    color: catColor,
                    border: `1px solid ${catColor}30`,
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Updated at */}
        <p className="mt-3 text-[10px] text-[#212121]/35">
          {t('updatedLine', {
            date: new Date(doc.updatedAt).toLocaleDateString(locale, {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
          })}
        </p>
      </div>
    </motion.div>
  );
}

function MemberCategorySection({
  member,
  docs,
  memberPalette,
}: {
  member: FamilyMember;
  docs: Document[];
  memberPalette: MemberPaletteType;
}) {
  const t = useTranslations('pastelHome');
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const memberFirstName = member.name.split(/\s+/)[0];

  const categoryGroups = useMemo(() => {
    const map = new Map<string, Document[]>();
    docs.forEach((d) => {
      const arr = map.get(d.categoryId) ?? [];
      arr.push(d);
      map.set(d.categoryId, arr);
    });
    return CATEGORIES.filter((cat) => (map.get(cat.id)?.length ?? 0) > 0).map((cat) => ({
      cat,
      catDocs: map.get(cat.id) ?? [],
    }));
  }, [docs]);

  // Per-category alert counts (expired + soon-to-expire)
  const alertsByCat = useMemo(() => {
    const map = new Map<
      string,
      { count: number; firstDocId: string | null; urgency: 'expired' | 'soon' | null }
    >();
    for (const { cat, catDocs } of categoryGroups) {
      let count = 0;
      let firstDocId: string | null = null;
      let worstUrgency: 'expired' | 'soon' | null = null;
      for (const doc of catDocs) {
        const u = getDocumentExpiryUrgency(doc, DEFAULT_EXPIRY_WARN_DAYS);
        if (u) {
          count++;
          if (!firstDocId) firstDocId = doc.id;
          if (u === 'expired') worstUrgency = 'expired';
          else if (!worstUrgency) worstUrgency = 'soon';
        }
      }
      map.set(cat.id, { count, firstDocId, urgency: worstUrgency });
    }
    return map;
  }, [categoryGroups]);

  // Reset when member changes
  useEffect(() => {
    setSelectedCatId(null);
    setSelectedDocId(null);
  }, [member.id]);

  // Reset doc selection when category changes
  useEffect(() => {
    setSelectedDocId(null);
  }, [selectedCatId]);

  const selectedGroup = categoryGroups.find((g) => g.cat.id === selectedCatId) ?? null;
  const selectedDoc = selectedGroup?.catDocs.find((d) => d.id === selectedDocId) ?? null;

  if (categoryGroups.length === 0) {
    return (
      <section className="pastel-enter mt-7" style={{ animationDelay: '300ms' }}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[17px] font-bold text-[#212121]">
            {t('memberCategoriesTitle', { name: memberFirstName })}
          </h2>
          <Link
            href={`/document-vault?member=${encodeURIComponent(member.id)}&add=1`}
            className="text-[13px] font-semibold text-[#212121]/55"
          >
            {t('addDocsShort')}
          </Link>
        </div>
        <div className="rounded-[20px] bg-white/70 px-4 py-6 text-center shadow-[0_4px_16px_rgba(33,33,33,0.06)]">
          <p className="text-[13px] text-[#212121]/55">{t('noDocsForMember')}</p>
          <Link
            href={`/document-vault?member=${encodeURIComponent(member.id)}&add=1`}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-semibold text-white shadow-[0_4px_12px_rgba(33,33,33,0.12)]"
            style={{ background: memberPalette.avatarInk }}
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            {t('addDocument')}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="pastel-enter mt-7" style={{ animationDelay: '300ms' }}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[17px] font-bold text-[#212121]">
          {t('memberCategoriesTitle', { name: memberFirstName })}
        </h2>
        <Link
          href={`/document-vault?member=${encodeURIComponent(member.id)}`}
          className="text-[13px] font-semibold text-[#212121]/55"
        >
          {t('viewAll')}
        </Link>
      </div>

      {/* Horizontal round-button strip */}
      <div className="flex gap-4 overflow-x-auto pb-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categoryGroups.map(({ cat, catDocs }) => {
          const isSelected = selectedCatId === cat.id;
          const alerts = alertsByCat.get(cat.id);
          const alertCount = alerts?.count ?? 0;
          const alertUrgency = alerts?.urgency ?? null;
          const badgeColor =
            alertUrgency === 'expired'
              ? '#ef4444'
              : alertUrgency === 'soon'
                ? '#f97316'
                : cat.color;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                if (isSelected) {
                  setSelectedCatId(null);
                } else {
                  setSelectedCatId(cat.id);
                  if (alertCount > 0 && alerts?.firstDocId) {
                    setSelectedDocId(alerts.firstDocId);
                  }
                }
              }}
              className="relative flex shrink-0 flex-col items-center gap-1.5"
              style={{ width: 64 }}
            >
              {/* Circle wraps icon + badge entirely — `overflow-visible` not needed because badge is INSIDE */}
              <div
                className="relative flex h-[56px] w-[56px] items-center justify-center rounded-full transition-all duration-200"
                style={{
                  background: isSelected ? cat.color : `${cat.color}22`,
                  boxShadow: isSelected
                    ? `0 8px 20px ${cat.color}55, 0 0 0 3px ${cat.color}33`
                    : `0 4px 10px ${cat.color}28`,
                }}
              >
                <CategoryLucideIcon
                  name={cat.icon}
                  size={22}
                  style={{ color: isSelected ? '#fff' : cat.color }}
                />
                {/* Badge INSIDE the circle — guaranteed never to overlap any neighbour */}
                <span
                  className="absolute right-0.5 top-0.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full px-1 text-[9px] font-extrabold text-white shadow-[0_1px_3px_rgba(0,0,0,0.25)]"
                  style={{ background: badgeColor }}
                >
                  {alertCount > 0 ? alertCount : catDocs.length}
                </span>
                {/* Subtle alert pulse, contained inside the circle */}
                {alertUrgency && (
                  <span
                    className="pointer-events-none absolute right-0.5 top-0.5 h-[15px] w-[15px] animate-ping rounded-full opacity-50"
                    style={{ background: badgeColor }}
                    aria-hidden
                  />
                )}
              </div>
              <span
                className="max-w-[64px] truncate text-center text-[10px] font-semibold"
                style={{ color: isSelected ? cat.color : 'rgba(33,33,33,0.6)' }}
              >
                {cat.shortLabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Expanded panel — shows doc list OR inline doc detail */}
      <AnimatePresence mode="wait">
        {selectedGroup && (
          <motion.div
            key={selectedGroup.cat.id}
            initial={{ opacity: 0, y: -6, scaleY: 0.97 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -6, scaleY: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: 'top center' }}
            className="mt-3 overflow-hidden rounded-[20px] bg-white shadow-[0_6px_24px_rgba(33,33,33,0.09)]"
          >
            <AnimatePresence mode="wait">
              {selectedDoc ? (
                <InlineDocDetail
                  key={selectedDoc.id}
                  doc={selectedDoc}
                  catColor={selectedGroup.cat.color}
                  catIcon={selectedGroup.cat.icon}
                  catLabel={selectedGroup.cat.label}
                  onBack={() => setSelectedDocId(null)}
                />
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* Panel header */}
                  <div
                    className="flex items-center gap-3 px-4 py-3"
                    style={{ borderBottom: `1.5px solid ${selectedGroup.cat.color}22` }}
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
                      style={{ background: `${selectedGroup.cat.color}1e` }}
                    >
                      <CategoryLucideIcon
                        name={selectedGroup.cat.icon}
                        size={18}
                        style={{ color: selectedGroup.cat.color }}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-bold text-[#212121]">
                        {selectedGroup.cat.label}
                      </p>
                      <p className="text-[11px] text-[#212121]/50">
                        {t('docCountInCategory', { count: selectedGroup.catDocs.length })}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCatId(null)}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F6F5FA]"
                    >
                      <X className="h-3.5 w-3.5 text-[#212121]/50" />
                    </button>
                  </div>

                  {/* Doc rows */}
                  <div className="flex flex-col divide-y divide-[#212121]/05">
                    {selectedGroup.catDocs.map((doc) => {
                      const urgency = getDocumentExpiryUrgency(doc, DEFAULT_EXPIRY_WARN_DAYS);
                      return (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => setSelectedDocId(doc.id)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-[#f6f5fa]"
                        >
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]"
                            style={{ background: `${selectedGroup.cat.color}18` }}
                          >
                            <CategoryLucideIcon
                              name={selectedGroup.cat.icon}
                              size={15}
                              style={{ color: selectedGroup.cat.color }}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-semibold text-[#212121]">
                              {doc.title}
                            </p>
                            {urgency ? (
                              <p
                                className="text-[11px] font-medium"
                                style={{ color: urgency === 'expired' ? '#ef4444' : '#f97316' }}
                              >
                                {urgency === 'expired' ? t('badgeExpired') : t('docRowExpiringSoon')}
                              </p>
                            ) : doc.fields && Object.keys(doc.fields).length > 0 ? (
                              <p className="truncate text-[11px] text-[#212121]/45">
                                {Object.entries(doc.fields)
                                  .slice(0, 1)
                                  .map(([, v]) => v)
                                  .join('')}
                              </p>
                            ) : null}
                          </div>
                          {urgency && (
                            <AlertTriangle
                              className="h-4 w-4 shrink-0"
                              style={{ color: urgency === 'expired' ? '#ef4444' : '#f97316' }}
                            />
                          )}
                          <ChevronRight className="h-4 w-4 shrink-0 text-[#212121]/25" />
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ─── Bento Grid ─────────────────────────────────────────────────────────────
function PastelBentoGrid({
  memberCount,
  docCount,
  categoryCount,
  barHeights,
  onViewAllMembers,
}: {
  memberCount: number;
  docCount: number;
  categoryCount: number;
  barHeights: number[];
  onViewAllMembers: () => void;
}) {
  const t = useTranslations('pastelHome');
  const m = usePastelCountUp(memberCount, true);
  const d = usePastelCountUp(docCount, true);
  const c = usePastelCountUp(categoryCount, true);
  const bars = barHeights.slice(0, 8);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div
        className={cn(
          'pastel-enter rounded-[20px] border border-[#212121]/10 bg-white p-4 shadow-[0_8px_24px_rgba(33,33,33,0.06)]',
          'min-h-[140px] border-l-[3px] border-l-[#7C3AED]'
        )}
        style={{ animationDelay: '450ms' }}
      >
        <p className="text-xs font-medium text-[#212121]/55">{t('membersLabel')}</p>
        <p className="mt-1 text-[34px] font-bold leading-none tracking-tight text-[#7C3AED]">{m}</p>
        <p className="mt-1 text-[13px] font-medium text-[#212121]/65">{t('membersSub')}</p>
        <button
          type="button"
          onClick={(e) => {
            pastelRipple(e);
            onViewAllMembers();
          }}
          className="relative mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-[#4338C9] underline decoration-[#4338C9]/35 underline-offset-2"
        >
          {t('viewAll')}
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      </div>
      <div
        className={cn(
          'pastel-enter rounded-[20px] border border-[#212121]/10 bg-white p-4 shadow-[0_8px_24px_rgba(33,33,33,0.06)]',
          'min-h-[140px]'
        )}
        style={{ animationDelay: '600ms' }}
      >
        <p className="text-xs font-medium text-[#212121]/55">{t('documentsLabel')}</p>
        <p className="mt-1 text-[34px] font-bold leading-none tracking-tight text-[#212121]">{d}</p>
        <p className="mt-1 text-[13px] font-medium text-[#212121]/65">{t('documentsSub')}</p>
        <Link
          href="/document-vault"
          onClick={pastelRipple}
          className="relative mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-[#212121]"
        >
          {t('browse')}
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        </Link>
      </div>
      <div
        className={cn(
          'pastel-enter col-span-2 flex min-h-[128px] gap-4 rounded-[20px] border border-[#212121]/10 bg-white p-4 shadow-[0_8px_24px_rgba(33,33,33,0.06)]'
        )}
        style={{ animationDelay: '750ms' }}
      >
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-[#212121]/55">{t('categoriesLabel')}</p>
          <p className="mt-1 text-[34px] font-bold leading-none tracking-tight text-[#212121]">
            {c}
          </p>
          <p className="mt-1 text-[13px] font-medium text-[#212121]/65">{t('categoriesSub')}</p>
        </div>
        <div className="flex flex-1 items-end justify-center gap-1 sm:gap-1.5">
          {bars.map((h, i) => (
            <div key={`bar-${i}`} className="flex h-[72px] w-2 items-end justify-center sm:w-2.5">
              <div
                className="pastel-bar-fill w-full rounded-full bg-[#212121]/22"
                style={{
                  height: `${Math.max(10, h)}%`,
                  animationDelay: `${800 + i * 60}ms`,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function computeSwipeDir(from: number, to: number, len: number): number {
  if (len <= 0 || from === to) return 1;
  const forward = (to - from + len) % len;
  const backward = (from - to + len) % len;
  return forward <= backward ? 1 : -1;
}

const cardVariants = {
  enter: (dir: number) => ({
    x: dir * 28,
    scale: 0.96,
    opacity: 0,
  }),
  center: {
    x: 0,
    scale: 1,
    opacity: 1,
    transition: { duration: 0.4, ease: SPRING },
  },
  exit: (dir: number) => ({
    x: -dir * 28,
    scale: 0.96,
    opacity: 0,
    transition: { duration: 0.22, ease: SPRING },
  }),
};

export interface FamilyPastelHomeProps {
  displayMembers: FamilyMember[];
  documentsByMemberId: (id: string) => Document[];
  memberCount: number;
  docCount: number;
  categoryCount: number;
  categoryHistogram: number[];
  onAddMember: () => void;
  onEditMember: (member: FamilyMember) => void;
}

export default function FamilyPastelHome({
  displayMembers,
  documentsByMemberId,
  memberCount,
  docCount,
  categoryCount,
  categoryHistogram,
  onAddMember,
  onEditMember,
}: FamilyPastelHomeProps) {
  const t = useTranslations('pastelHome');
  const tc = useTranslations('common');
  const noiseFilterId = useId().replace(/:/g, '');
  const { refreshVaultData } = useVaultData();

  const [docCountsRefreshing, setDocCountsRefreshing] = useState(false);
  const [showAllMembers, setShowAllMembers] = useState(false);
  const { accentMemberId, setAccentMemberId, accentHydrated } = usePastelMemberAccent();
  const n = displayMembers.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [navDir, setNavDir] = useState(1);
  const touchRef = useRef<{ x: number } | null>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const profilesSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (n === 0) return;
    setActiveIndex((i) => Math.min(Math.max(i, 0), n - 1));
  }, [n]);

  const navigateTo = useCallback(
    (i: number) => {
      if (n <= 0 || i === activeIndex) return;
      setNavDir(computeSwipeDir(activeIndex, i, n));
      setActiveIndex(i);
      setAccentMemberId(displayMembers[i]?.id ?? null);
    },
    [n, activeIndex, displayMembers, setAccentMemberId]
  );

  const focusMemberProfile = useCallback(
    (index: number) => {
      if (n <= 0) return;
      if (index !== activeIndex) {
        setNavDir(computeSwipeDir(activeIndex, index, n));
        setActiveIndex(index);
        setAccentMemberId(displayMembers[index]?.id ?? null);
      }
      setShowAllMembers(false);
      requestAnimationFrame(() => {
        profilesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    },
    [n, activeIndex, displayMembers, setAccentMemberId]
  );

  const goNext = useCallback(() => {
    if (n <= 0) return;
    navigateTo((activeIndex + 1) % n);
  }, [n, activeIndex, navigateTo]);

  const goPrev = useCallback(() => {
    if (n <= 0) return;
    navigateTo((activeIndex - 1 + n) % n);
  }, [n, activeIndex, navigateTo]);

  const member = n > 0 ? displayMembers[activeIndex] : null;

  const memberIdsKey = useMemo(() => displayMembers.map((m) => m.id).join('\0'), [displayMembers]);

  useEffect(() => {
    if (n === 0 || !accentHydrated) return;
    if (!accentMemberId) return;
    const i = displayMembers.findIndex((m) => m.id === accentMemberId);
    if (i >= 0) setActiveIndex(i);
    else {
      setActiveIndex(0);
      setAccentMemberId(displayMembers[0]?.id ?? null);
    }
  }, [accentMemberId, accentHydrated, n, memberIdsKey, setAccentMemberId, displayMembers]);

  useEffect(() => {
    if (!accentHydrated || n === 0) return;
    if (accentMemberId != null) return;
    const first = displayMembers[0];
    if (first?.id) setAccentMemberId(first.id);
  }, [accentHydrated, n, accentMemberId, memberIdsKey, setAccentMemberId, displayMembers]);
  const memberVisualKey = useMemo(
    () => displayMembers.map((m) => `${m.id}:${m.avatarColor}`).join('\0'),
    [displayMembers]
  );

  const palette = member
    ? pastelPaletteFromAvatarColor(member.avatarColor)
    : PASTEL_ACCENT_PLACEHOLDER_PALETTE;

  /** Rear stack cards use each layer’s member tint (not the front card’s gradient). */
  const { paletteGhostFar, paletteGhostMid } = useMemo(() => {
    if (n < 2) {
      return { paletteGhostFar: null, paletteGhostMid: null };
    }
    const idxMid = (((activeIndex - 1) % n) + n) % n;
    let idxFar = (((activeIndex - 2) % n) + n) % n;
    if (idxFar === activeIndex) idxFar = idxMid;
    return {
      paletteGhostFar: pastelPaletteFromAvatarColor(displayMembers[idxFar].avatarColor),
      paletteGhostMid: pastelPaletteFromAvatarColor(displayMembers[idxMid].avatarColor),
    };
  }, [n, activeIndex, memberVisualKey, displayMembers]);

  const docs = member ? documentsByMemberId(member.id) : [];
  const docCountMember = docs.length;
  const animatedDocCount = usePastelCountUp(docCountMember, n > 0);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const start = touchRef.current;
      if (!start || !e.changedTouches[0]) return;
      touchRef.current = null;
      const dx = e.changedTouches[0].clientX - start.x;
      if (dx > 48) goPrev();
      else if (dx < -48) goNext();
    },
    [goNext, goPrev]
  );

  const handleRefreshDocCounts = useCallback(async () => {
    setDocCountsRefreshing(true);
    try {
      await refreshVaultData();
    } finally {
      setDocCountsRefreshing(false);
    }
  }, [refreshVaultData]);

  const headerIconBtn =
    'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_4px_18px_rgba(33,33,33,0.1)] border border-[#212121]/06 transition-transform active:scale-[0.97]';

  return (
    <div className="font-urbanist min-h-full bg-[#F6F5FA] pb-6 lg:pb-10">
      <header
        className="pastel-enter px-4 pt-[env(safe-area-inset-top)]"
        style={{ animationDelay: '0ms' }}
      >
        <div className="grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-3 py-3">
          <span className="h-11 w-11 shrink-0" aria-hidden />
          <div className="min-w-0 text-center">
            <h1 className="truncate text-[17px] font-bold leading-tight text-[#212121]">
              {t('title')}
            </h1>
            <p className="truncate text-[12px] font-medium text-[#212121]/52">{t('subtitle')}</p>
          </div>
          <button
            type="button"
            aria-label={t('addMember')}
            className={cn(headerIconBtn, 'relative overflow-hidden')}
            onClick={(e) => {
              pastelRipple(e);
              onAddMember();
            }}
          >
            <Plus className="h-5 w-5 text-[#212121]" strokeWidth={2.5} />
          </button>
        </div>
      </header>

      <div className="px-4">
        {n === 0 ? (
          <div
            className="pastel-enter mx-auto mt-4 max-w-md rounded-[28px] bg-white p-8 text-center shadow-[0_8px_24px_rgba(33,33,33,0.08)]"
            style={{ animationDelay: '150ms' }}
          >
            <p className="text-[17px] font-bold text-[#212121]">{t('emptyTitle')}</p>
            <p className="mt-2 text-[14px] text-[#212121]/55">{t('emptyBody')}</p>
            <button
              type="button"
              onClick={onAddMember}
              className="relative mx-auto mt-5 overflow-hidden rounded-full bg-[#212121] px-8 py-3 text-[14px] font-semibold text-white shadow-[0_8px_24px_rgba(33,33,33,0.15)]"
            >
              <Plus className="mr-2 inline h-4 w-4" strokeWidth={2.5} />
              {t('addMember')}
            </button>
          </div>
        ) : (
          <>
            <div
              ref={profilesSectionRef}
              id="family-member-profiles"
              className="pastel-enter relative mx-auto mt-2 w-full scroll-mt-4"
              style={{ animationDelay: '150ms', maxWidth: PASTEL_CARD_MAX_W + 24 }}
            >
              <div
                className="relative mx-auto w-[min(94vw,384px)]"
                style={{
                  height: PASTEL_CARD_H + 2 * PASTEL_CARD_STACK_PEEK_PX,
                  touchAction: 'pan-y',
                }}
                onTouchStart={(e) => {
                  touchRef.current = { x: e.touches[0].clientX };
                }}
                onTouchEnd={onTouchEnd}
              >
                <div
                  className="pointer-events-none absolute left-1/2 top-0 z-0 w-full -translate-x-1/2"
                  style={{ height: PASTEL_CARD_H }}
                >
                  <div
                    className="pastel-ghost-stack-in absolute left-0 right-0 rounded-[22px] shadow-[0_6px_24px_rgba(33,33,33,0.08)]"
                    style={{
                      top: 0,
                      height: PASTEL_CARD_H,
                      transform: 'scale(0.94)',
                      transformOrigin: 'top center',
                      background: paletteGhostFar
                        ? `linear-gradient(168deg, ${paletteGhostFar.ghost2} 0%, ${paletteGhostFar.ghost1} 55%, ${paletteGhostFar.ghost2} 100%)`
                        : '#e8e8ec',
                      boxShadow: paletteGhostFar
                        ? `0 10px 28px ${paletteGhostFar.cardShadow}`
                        : undefined,
                      animationDelay: '200ms',
                    }}
                  />
                  <div
                    className="pastel-ghost-stack-in absolute left-0 right-0 rounded-[22px] shadow-[0_6px_24px_rgba(33,33,33,0.09)]"
                    style={{
                      top: PASTEL_CARD_STACK_PEEK_PX,
                      height: PASTEL_CARD_H,
                      transform: 'scale(0.97)',
                      transformOrigin: 'top center',
                      background: paletteGhostMid
                        ? `linear-gradient(168deg, ${paletteGhostMid.ghost1} 0%, ${paletteGhostMid.ghost2} 50%, ${paletteGhostMid.ghost1} 100%)`
                        : '#ececf0',
                      boxShadow: paletteGhostMid
                        ? `0 12px 32px ${paletteGhostMid.cardShadow}`
                        : undefined,
                      animationDelay: '250ms',
                    }}
                  />
                </div>

                <div
                  className="absolute left-1/2 z-10 w-full -translate-x-1/2"
                  style={{
                    top: 2 * PASTEL_CARD_STACK_PEEK_PX,
                    perspective: 700,
                  }}
                >
                  <AnimatePresence mode="wait" custom={navDir}>
                    {member ? (
                      <motion.div
                        key={member.id}
                        custom={navDir}
                        variants={cardVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="pastel-stack-main-in relative overflow-hidden rounded-[22px] shadow-[0_20px_50px_rgba(33,33,33,0.14)]"
                        style={{
                          width: '100%',
                          height: PASTEL_CARD_H,
                          minHeight: PASTEL_CARD_H,
                          background: palette.gradient,
                          boxShadow: `0 24px 48px ${palette.cardShadow}, 0 8px 24px rgba(33,33,33,0.1)`,
                        }}
                      >
                        <div
                          className="h-full rounded-[22px]"
                          style={{
                            height: PASTEL_CARD_H,
                            minHeight: PASTEL_CARD_H,
                            transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
                            transformStyle: 'preserve-3d',
                            transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
                          }}
                          onPointerMove={(e) => {
                            const r = e.currentTarget.getBoundingClientRect();
                            const px = (e.clientX - r.left) / r.width - 0.5;
                            const py = (e.clientY - r.top) / r.height - 0.5;
                            e.currentTarget.style.transition = 'none';
                            setTilt({
                              rx: Math.max(-6, Math.min(6, -py * 12)),
                              ry: Math.max(-6, Math.min(6, px * 12)),
                            });
                          }}
                          onPointerLeave={(e) => {
                            e.currentTarget.style.transition =
                              'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
                            setTilt({ rx: 0, ry: 0 });
                          }}
                        >
                          <svg
                            className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden rounded-[22px]"
                            aria-hidden
                          >
                            <defs>
                              <filter
                                id={`nf-${noiseFilterId}`}
                                x="-20%"
                                y="-20%"
                                width="140%"
                                height="140%"
                              >
                                <feTurbulence
                                  type="fractalNoise"
                                  baseFrequency="0.85"
                                  numOctaves="3"
                                  stitchTiles="stitch"
                                  result="turb"
                                />
                                <feColorMatrix
                                  in="turb"
                                  type="matrix"
                                  values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.2 0"
                                  result="soft"
                                />
                              </filter>
                            </defs>
                            <rect
                              width="100%"
                              height="100%"
                              fill="#ffffff"
                              filter={`url(#nf-${noiseFilterId})`}
                              opacity="0.14"
                            />
                          </svg>

                          <div
                            className="pastel-card-shimmer pointer-events-none absolute inset-0 overflow-hidden rounded-[22px]"
                            aria-hidden
                          >
                            <div
                              className="absolute -left-1/2 top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/45 to-transparent"
                              style={{ transform: 'skewX(-16deg)' }}
                            />
                          </div>

                          <div className="relative flex h-full min-h-0 flex-col gap-1 p-4 text-white">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="line-clamp-2 text-balance text-[17px] font-bold leading-snug text-white drop-shadow-sm">
                                  {member.name}
                                </p>
                                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[2px] text-white/75">
                                  {member.relationship}
                                </p>
                              </div>
                              <div className="shrink-0 text-right">
                                <p className="text-[10px] font-bold uppercase tracking-[3px] text-white/85">
                                  {t('vaultWordmark')}
                                </p>
                                <p className="mt-0.5 text-[11px] font-semibold text-white/80">
                                  {t('since', { date: formatMonthYear(member.createdAt) })}
                                </p>
                              </div>
                            </div>

                            {/* Member photo centred on the card */}
                            <div className="mt-2 flex min-h-0 flex-1 flex-col items-center justify-center gap-3">
                              <div
                                className="relative"
                                style={{
                                  filter: `drop-shadow(0 8px 24px ${palette.cardShadow})`,
                                }}
                              >
                                {/* soft glow ring */}
                                <div
                                  className="absolute inset-0 rounded-full"
                                  style={{
                                    boxShadow: `0 0 0 3px ${resolveMemberColor(member.avatarColor).border}, 0 0 0 6px rgba(255,255,255,0.18), 0 0 0 12px rgba(255,255,255,0.08)`,
                                    borderRadius: '50%',
                                  }}
                                />
                                <MemberAvatar
                                  name={member.name}
                                  avatarColor={member.avatarColor}
                                  photoDataUrl={member.photoDataUrl}
                                  className="h-[76px] w-[76px] rounded-full ring-[3px] ring-white/50 shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
                                  textClassName="text-[22px]"
                                />
                              </div>

                              {/* Doc count pushed below the avatar */}
                              <div className="text-center">
                                <p className="text-[10px] font-medium text-white/70">
                                  {t('totalDocuments')}
                                </p>
                                <motion.p
                                  key={`count-${member.id}`}
                                  initial={{ scale: 0.72, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{
                                    type: 'spring',
                                    stiffness: 340,
                                    damping: 22,
                                    delay: 0.06,
                                  }}
                                  className="mt-0.5 text-[30px] font-bold tabular-nums leading-none tracking-tight text-white drop-shadow-sm"
                                >
                                  {animatedDocCount}
                                  <span className="text-[16px] font-semibold text-white/80">
                                    {t('docsSuffix')}
                                  </span>
                                </motion.p>
                              </div>
                            </div>

                            <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                              <Link
                                href={`/document-vault?member=${encodeURIComponent(member.id)}&add=1`}
                                onClick={pastelRipple}
                                className="relative inline-flex max-w-[58%] overflow-hidden rounded-full bg-white px-3 py-2 text-[11px] font-bold text-[#212121] shadow-[0_4px_16px_rgba(33,33,33,0.12)]"
                              >
                                <Plus className="mr-1.5 h-4 w-4" strokeWidth={2.5} />
                                {t('addDocument')}
                              </Link>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    pastelRipple(e);
                                    void handleRefreshDocCounts();
                                  }}
                                  disabled={docCountsRefreshing}
                                  aria-label={t('refreshDocumentCounts')}
                                  title={t('refreshDocumentCounts')}
                                  className={cn(
                                    headerIconBtn,
                                    'relative h-10 w-10 overflow-hidden border-0 disabled:opacity-50'
                                  )}
                                >
                                  <RefreshCw
                                    className={cn(
                                      'h-4 w-4 text-[#212121]',
                                      docCountsRefreshing && 'animate-spin'
                                    )}
                                    strokeWidth={2}
                                  />
                                </button>
                                <Link
                                  href={`/document-vault?member=${encodeURIComponent(member.id)}`}
                                  onClick={pastelRipple}
                                  aria-label={t('viewMemberDocuments')}
                                  title={t('viewMemberDocuments')}
                                  className={cn(
                                    headerIconBtn,
                                    'relative h-10 w-10 overflow-hidden border-0'
                                  )}
                                >
                                  <Eye className="h-4 w-4 text-[#212121]" strokeWidth={2} />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>

              {member && (!isDemoMemberId(member.id) || isDemoMode()) ? (
                <div className="mt-3 flex justify-center">
                  <button
                    type="button"
                    className="text-[12px] font-semibold text-[#212121]/55 underline decoration-[#212121]/25 underline-offset-2"
                    onClick={() => onEditMember(member)}
                  >
                    {tc('edit')}
                  </button>
                </div>
              ) : null}

              {n > 1 ? (
                <div className="mt-4 flex items-center justify-center gap-2">
                  {displayMembers.map((m, i) => {
                    const dotInk = pastelPaletteFromAvatarColor(m.avatarColor).avatarInk;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        aria-label={`${m.name}`}
                        className={cn(
                          'h-2 rounded-full transition-all duration-300',
                          i === activeIndex ? 'w-8' : 'w-2 hover:opacity-80'
                        )}
                        style={{
                          background: i === activeIndex ? dotInk : 'rgba(33,33,33,0.28)',
                        }}
                        onClick={() => navigateTo(i)}
                      />
                    );
                  })}
                </div>
              ) : null}
            </div>

            {member && (
              <MemberCategorySection member={member} docs={docs} memberPalette={palette} />
            )}

            <section className="pastel-enter mt-5" style={{ animationDelay: '380ms' }}>
              <PastelBentoGrid
                memberCount={memberCount}
                docCount={docCount}
                categoryCount={categoryCount}
                barHeights={categoryHistogram}
                onViewAllMembers={() => setShowAllMembers(true)}
              />
            </section>
          </>
        )}
      </div>

      <Modal
        isOpen={showAllMembers}
        onClose={() => setShowAllMembers(false)}
        title={t('allMembersTitle')}
        subtitle={t('allMembersSubtitle')}
      >
        <ul className="max-h-[60vh] space-y-2 overflow-y-auto">
          {displayMembers.map((m, i) => {
            const docs = documentsByMemberId(m.id);
            const mc = resolveMemberColor(m.avatarColor);
            const isActive = i === activeIndex;
            return (
              <li key={m.id}>
                <div
                  className={cn(
                    'flex items-center gap-3 rounded-2xl border px-3 py-3 transition-colors',
                    isActive
                      ? 'border-[#4338C9]/35 bg-[#4338C9]/06'
                      : 'border-[#212121]/08 bg-white'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => focusMemberProfile(i)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <div
                      className="h-11 w-11 shrink-0 overflow-hidden rounded-full border-2"
                      style={{ borderColor: mc.border }}
                    >
                      <MemberAvatar
                        name={m.name}
                        avatarColor={m.avatarColor}
                        photoDataUrl={m.photoDataUrl}
                        className="h-full w-full rounded-full"
                        textClassName="text-sm"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#212121]">{m.name}</p>
                      <p className="truncate text-xs text-[#212121]/55">
                        {m.relationship}
                        {m.dob ? ` · ${m.dob}` : ''}
                        {` · ${docs.length} doc${docs.length === 1 ? '' : 's'}`}
                      </p>
                    </div>
                  </button>
                  <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => focusMemberProfile(i)}
                      className="rounded-full bg-[#4338C9] px-3 py-1.5 text-[11px] font-bold text-white"
                    >
                      {t('viewProfile')}
                    </button>
                    {!isDemoMemberId(m.id) || isDemoMode() ? (
                      <button
                        type="button"
                        onClick={() => {
                          setShowAllMembers(false);
                          onEditMember(m);
                        }}
                        className="rounded-full border border-[#212121]/12 px-3 py-1.5 text-[11px] font-semibold text-[#212121]"
                      >
                        {tc('edit')}
                      </button>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Modal>
    </div>
  );
}
