'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Eye,
  EyeOff,
  FilePlus,
  Pencil,
  Plus,
  Search,
  UserPlus,
  StickyNote,
  MoveHorizontal,
  X,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { FamilyMember, Document } from '@/lib/storage';
import { CATEGORIES, getCategoryById } from '@/lib/categories';
import CopyValueButton from '@/components/ui/CopyValueButton';
import { CategoryLucideIcon } from '@/lib/categoryLucideIcons';
import {
  hexAlpha,
  resolveMemberColor,
  type MemberColorDef,
} from '@/lib/memberAvatarColors';
import { isDemoMemberId } from '@/lib/demoFamilyMembers';
import BrandMarkSvg from '@/components/ui/BrandMarkSvg';
import VaultPageHeading from '@/components/ui/VaultPageHeading';
import { cn } from '@/lib/utils';
import { usePastelMemberAccent } from '@/context/PastelMemberAccentContext';
import {
  DEFAULT_EXPIRY_WARN_DAYS,
  getDocumentExpiryUrgency,
  formatExpirySummary,
  parseExpiryValue,
  EXPIRY_FIELD_KEYS,
} from '@/lib/documentExpiry';
import {
  collectMemberDocumentSearchHits,
  documentMatchesSearch,
  getSearchMatchHint,
  memberMatchesSearch,
} from '@/lib/documentSearch';

const SPRING = [0.16, 1, 0.3, 1] as const;
const STACK_SPRING = { type: 'spring', stiffness: 380, damping: 32, mass: 0.7 } as const;
const CARD_W = 189;
const CARD_H = 214;
const FAN_STEP = 62;
const FAN_MAX = 2;

/** Shortest signed distance on a ring so the focused card is always slot 0. */
function wrapOffset(index: number, focus: number, count: number): number {
  if (count <= 1) return 0;
  let d = index - focus;
  const half = Math.floor(count / 2);
  if (d > half) d -= count;
  if (d < -half) d += count;
  return d;
}

function glassCardWashStyle(mc: MemberColorDef): React.CSSProperties {
  return {
    backgroundImage: `linear-gradient(165deg, rgba(255,255,255,0.82) 0%, ${hexAlpha(mc.bg, 0.96)} 58%, ${hexAlpha(mc.border, 0.16)} 100%)`,
  };
}

function displayMemberName(name: string): string {
  return name.trim().toLocaleUpperCase();
}

function MemberCarouselCard({
  member,
  index,
  total,
  selected,
  offset,
  onSelect,
  docCount,
  categoryCount,
}: {
  member: FamilyMember;
  index: number;
  total: number;
  selected: boolean;
  offset: number;
  onSelect: () => void;
  docCount: number;
  categoryCount: number;
}) {
  const t = useTranslations('pastelHome');
  const mc = resolveMemberColor(member.avatarColor);
  const abs = Math.abs(offset);
  const label = `${String(index + 1).padStart(2, '0')}/${String(total).padStart(2, '0')}`;

  if (abs > FAN_MAX) return null;

  return (
    <motion.button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      aria-expanded={selected}
      aria-label={member.name}
      initial={false}
      animate={{
        x: offset * FAN_STEP,
        y: selected ? -10 : abs * 22,
        rotate: offset * 8,
        scale: selected ? 1 : Math.max(0.84, 0.94 - abs * 0.05),
        opacity: 1,
        zIndex: 20 - abs,
      }}
      transition={STACK_SPRING}
      whileTap={{ scale: selected ? 0.98 : 0.92 }}
      className="cream-wallet-card absolute top-3 origin-bottom overflow-hidden text-left"
      style={{
        width: CARD_W,
        height: CARD_H,
        left: '50%',
        marginLeft: -CARD_W / 2,
        borderRadius: 28,
        background: mc.bg,
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(255,255,255,0.78)',
        boxShadow: selected
          ? `0 22px 40px ${hexAlpha(mc.border, 0.38)}, 0 0 36px ${hexAlpha(mc.border, 0.22)}`
          : `0 10px 24px ${hexAlpha(mc.border, 0.24)}`,
      }}
    >
      <div className="pointer-events-none absolute inset-0" style={glassCardWashStyle(mc)} />
      <div className="relative z-[1] flex h-full flex-col">
        {selected ? (
          <div className="flex items-start justify-between px-4 pt-4">
            <div className="min-w-0 text-left">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#1a1a1a]/55">
                {t('documentsLabel')}
              </p>
              <p className="mt-0.5 text-[20px] font-bold tabular-nums leading-none text-[#1a1a1a]">
                {docCount}
              </p>
            </div>
            <div className="min-w-0 text-right">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#1a1a1a]/55">
                {t('categoriesLabel')}
              </p>
              <p className="mt-0.5 text-[20px] font-bold tabular-nums leading-none text-[#1a1a1a]">
                {categoryCount}
              </p>
            </div>
          </div>
        ) : (
          <div className="h-14" />
        )}
        <div
          className="mt-auto flex min-h-[62px] items-center justify-between gap-3 border-t border-white/50 px-4 py-3"
          style={{
            background: hexAlpha(mc.border, 0.28),
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.42)',
          }}
        >
          <div className="min-w-0">
            <p className="truncate text-[9px] font-medium uppercase tracking-[0.14em] text-[#1a1a1a]/55">
              {member.relationship}
            </p>
            <p className="mt-0.5 truncate text-[15px] font-bold uppercase leading-tight tracking-[0.06em] text-[#1a1a1a]">
              {displayMemberName(member.name)}
            </p>
          </div>
          <p className="shrink-0 text-[12px] font-semibold tabular-nums tracking-wide text-[#1a1a1a]/72">
            {label}
          </p>
        </div>
      </div>
      <span className="sr-only">{t('docsSuffix')}</span>
    </motion.button>
  );
}

// ─── Member Category Section ───────────────────────────────────────────────
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
  onEdit,
}: {
  doc: Document;
  catColor: string;
  catIcon: string;
  catLabel: string;
  onBack: () => void;
  onEdit: (doc: Document) => void;
}) {
  const t = useTranslations('pastelHome');
  const tc = useTranslations('common');
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
        return { label: key, summary: formatExpirySummary(daysUntil), daysUntil };
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
      className="flex w-full flex-col"
    >
      {/* ── Header ── */}
      <div
        className="flex items-center gap-2.5 px-3 py-3"
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
          <div className="mt-0.5 flex items-center gap-1.5">
            <p className="min-w-0 truncate text-[14px] font-bold text-[#212121]">{doc.title}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onEdit(doc)}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#212121] px-3 py-1.5 text-[11px] font-bold text-white shadow-[0_4px_12px_rgba(33,33,33,0.18)] transition-transform active:scale-95"
        >
          <Pencil className="h-3 w-3" strokeWidth={2.5} />
          {tc('edit')}
        </button>
      </div>

      {/* expiry/urgency badges under header when present */}
      {(urgency === 'expired' || urgency === 'soon') && (
        <div className="flex justify-end gap-1.5 px-3 pt-2">
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
      )}

      {/* ── Expiry alert banner ── */}
      {urgency && expiryBanner && (
        <div
          className="mx-3 mt-3 flex items-start gap-2.5 rounded-[12px] px-3 py-2.5"
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
          <div className="grid grid-cols-1 gap-2">
            {fieldEntries.map(([key, value]) => {
              const catField = catConfig?.fields.find((f) => f.key === key);
              const isSensitive = catField?.sensitive ?? false;
              const isRevealed = revealedFields.has(key);
              const displayValue = isSensitive && !isRevealed ? maskValue(value) : value;

              return (
                <div
                  key={key}
                  className="rounded-[12px] px-3.5 py-2.5"
                  style={{
                    background: '#F6F5FA',
                    border: '1px solid rgba(33,33,33,0.07)',
                  }}
                >
                  <p className="break-words text-[11px] font-semibold leading-snug text-[#212121]/50">
                    {catField?.label ?? key}
                  </p>
                  <div className="mt-1 flex items-start justify-between gap-2">
                    <p className="min-w-0 flex-1 break-words text-[13px] font-bold leading-snug text-[#212121]">
                      {displayValue}
                    </p>
                    <div className="flex shrink-0 items-center gap-0.5">
                      {catField?.type !== 'select' && <CopyValueButton value={value} compact />}
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
            <div className="mb-1.5">
              <p className="text-[10px] font-bold uppercase tracking-[1px] text-[#212121]/45">
                {t('tagsHeading')}
              </p>
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

        <button
          type="button"
          onClick={() => onEdit(doc)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#212121] py-3 text-[13px] font-bold text-white shadow-[0_8px_20px_rgba(33,33,33,0.14)] transition-transform active:scale-[0.98]"
        >
          <Pencil className="h-4 w-4" strokeWidth={2.25} />
          {tc('edit')} document
        </button>
      </div>
    </motion.div>
  );
}

function MemberCategorySection({
  member,
  docs,
  onAddDocument,
  onEditDocument,
  focusDocId = null,
}: {
  member: FamilyMember;
  docs: Document[];
  onAddDocument: (opts: { memberId: string; categoryId?: string }) => void;
  onEditDocument: (doc: Document) => void;
  focusDocId?: string | null;
}) {
  const t = useTranslations('pastelHome');
  const tc = useTranslations('common');
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const memberFirstName = displayMemberName(member.name.split(/\s+/)[0] ?? member.name);

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

  useEffect(() => {
    if (!focusDocId) return;
    const doc = docs.find((d) => d.id === focusDocId);
    if (!doc) return;
    setSelectedCatId(doc.categoryId);
    setSelectedDocId(doc.id);
  }, [focusDocId, docs]);

  // Reset doc selection when category changes
  useEffect(() => {
    setSelectedDocId(null);
  }, [selectedCatId]);

  const selectedGroup = categoryGroups.find((g) => g.cat.id === selectedCatId) ?? null;
  const selectedDoc = selectedGroup?.catDocs.find((d) => d.id === selectedDocId) ?? null;

  if (categoryGroups.length === 0) {
    return (
      <section className="mt-1" data-walkthrough="member-docs">
        <div className="mb-1 flex items-baseline justify-center gap-2">
          <h2 className="text-[17px] font-bold text-[#212121]">
            {t('categoriesHeading', { count: 0 })}
          </h2>
        </div>
        <p className="mb-3 text-center text-[13px] text-[#212121]/50">
          {t('memberCategoriesTitle', { name: memberFirstName })}
        </p>
        <div className="rounded-[20px] bg-white px-4 py-6 text-center shadow-[0_4px_16px_rgba(33,33,33,0.06)]">
          <p className="text-[13px] text-[#212121]/55">{t('noDocsForMember')}</p>
          <button
            type="button"
            onClick={() => onAddDocument({ memberId: member.id })}
            className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-vault-muted underline decoration-black/20 underline-offset-2"
          >
            {t('addDocument')}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-1" data-walkthrough="member-docs">
      <div className="mb-1 text-center">
        <h2 className="text-[17px] font-bold text-[#212121]">
          {t('categoriesHeading', { count: categoryGroups.length })}
        </h2>
      </div>
      <p className="mb-3 text-center text-[13px] text-[#212121]/50">
        {t('memberCategoriesTitle', { name: memberFirstName })}
      </p>

      {/* Horizontal round-button strip */}
      <div className="flex justify-center overflow-x-auto pb-2 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-4">
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
            className="mx-auto mt-3 w-full overflow-hidden rounded-[20px] bg-white shadow-[0_6px_24px_rgba(33,33,33,0.09)]"
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
                  onEdit={onEditDocument}
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
                    className="flex items-center gap-3 px-3 py-3"
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
                        <div
                          key={doc.id}
                          className="flex w-full items-center gap-2 px-3 py-2.5 transition-colors active:bg-[#f6f5fa]"
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedDocId(doc.id)}
                            className="flex min-w-0 flex-1 items-center gap-3 text-left"
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
                                  {urgency === 'expired'
                                    ? t('badgeExpired')
                                    : t('docRowExpiringSoon')}
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
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditDocument(doc);
                            }}
                            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#212121] px-2.5 py-1.5 text-[10px] font-bold text-white"
                          >
                            <Pencil className="h-3 w-3" strokeWidth={2.5} />
                            {tc('edit')}
                          </button>
                        </div>
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


export interface FamilyPastelHomeProps {
  displayMembers: FamilyMember[];
  documentsByMemberId: (id: string) => Document[];
  onAddMember: () => void;
  onEditMember: (member: FamilyMember) => void;
  onAddDocument: (opts: { memberId: string; categoryId?: string }) => void;
  onEditDocument: (doc: Document) => void;
}

export default function FamilyPastelHome({
  displayMembers,
  documentsByMemberId,
  onAddMember,
  onEditMember,
  onAddDocument,
  onEditDocument,
}: FamilyPastelHomeProps) {
  const t = useTranslations('pastelHome');
  const tc = useTranslations('common');
  const { setAccentMemberId } = usePastelMemberAccent();
  const n = displayMembers.length;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [docsOpen, setDocsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusDocId, setFocusDocId] = useState<string | null>(null);
  const query = searchQuery.trim().toLowerCase();

  const searchHits = useMemo(
    () => collectMemberDocumentSearchHits(displayMembers, documentsByMemberId, query),
    [displayMembers, documentsByMemberId, query]
  );

  const visibleMembers = useMemo(() => {
    if (!query) return displayMembers;
    return displayMembers.filter((m) =>
      memberMatchesSearch(m, documentsByMemberId(m.id), query)
    );
  }, [displayMembers, documentsByMemberId, query]);

  const openSearchHit = useCallback(
    (memberId: string, docId: string) => {
      const idx = displayMembers.findIndex((m) => m.id === memberId);
      if (idx < 0) return;
      setActiveIndex(idx);
      setAccentMemberId(memberId);
      setDocsOpen(true);
      setFocusDocId(docId);
    },
    [displayMembers, setAccentMemberId]
  );

  useEffect(() => {
    if (n === 0) {
      setActiveIndex(null);
      setDocsOpen(false);
      return;
    }
    setActiveIndex((i) => (i == null || i < 0 || i >= n ? 0 : i));
  }, [n]);

  const navigateTo = useCallback(
    (i: number) => {
      if (n <= 0 || i < 0 || i >= n) return;
      if (activeIndex === i) {
        setDocsOpen((open) => !open);
        return;
      }
      setActiveIndex(i);
      setDocsOpen(false);
      setAccentMemberId(displayMembers[i]?.id ?? null);
    },
    [n, activeIndex, displayMembers, setAccentMemberId]
  );

  const stepCarousel = useCallback(
    (dir: -1 | 1) => {
    if (n <= 0) return;
      const cur = activeIndex ?? 0;
      const next = (cur + dir + n) % n;
      setActiveIndex(next);
      setAccentMemberId(displayMembers[next]?.id ?? null);
    },
    [n, activeIndex, displayMembers, setAccentMemberId]
  );

  const member = activeIndex != null ? displayMembers[activeIndex] ?? null : null;
  const addDocMember = member ?? displayMembers[0] ?? null;

  useEffect(() => {
    if (!query) setFocusDocId(null);
  }, [query]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mid = new URLSearchParams(window.location.search).get('member');
    if (!mid) return;
    const i = displayMembers.findIndex((m) => m.id === mid);
    if (i < 0) return;
    setActiveIndex(i);
    setDocsOpen(true);
    setAccentMemberId(mid);
  }, [displayMembers, setAccentMemberId]);

  return (
    <div className="font-urbanist relative min-h-full overflow-x-clip bg-transparent pb-2 text-vault-text">
      <header
        className="pastel-enter relative z-20 px-3 pt-1 sm:px-4"
        style={{ animationDelay: '0ms' }}
      >
        <VaultPageHeading
          className="mb-0 py-2 sm:mb-0 sm:py-3"
          icon={<BrandMarkSvg size={56} title="Strong Vault" />}
          title={t('title')}
          description={t('subtitle')}
        />
      </header>

      <div className="relative z-[1] px-3 sm:px-4">
        {n === 0 ? (
          <div
            className="sv-icon-card pastel-enter relative z-[1] mx-auto mt-4 max-w-md rounded-[24px] p-6 text-center sm:rounded-[28px] sm:p-8"
            style={{ animationDelay: '150ms' }}
            data-walkthrough="family-empty"
          >
            <p className="text-[17px] font-bold text-vault-text">{t('emptyTitle')}</p>
            <p className="mt-2 text-[14px] text-vault-muted">{t('emptyBody')}</p>
            <button
              type="button"
              onClick={onAddMember}
              data-walkthrough="add-member"
              className="relative mx-auto mt-5 overflow-hidden rounded-full bg-vault-text px-8 py-3 text-[14px] font-semibold text-white shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
            >
              <Plus className="mr-2 inline h-4 w-4" strokeWidth={2.5} />
              {t('addMember')}
            </button>
          </div>
        ) : (
          <div
            className="pastel-enter relative mx-auto mt-2 w-full overflow-visible"
            style={{ animationDelay: '150ms' }}
            data-walkthrough="family-cards"
          >
            <div className="mb-7 flex items-start justify-center gap-4 sm:mb-8 sm:gap-8">
              <button
                type="button"
                data-walkthrough="add-member"
                aria-label={t('addMemberFab')}
                onClick={onAddMember}
                className="flex min-w-[4.25rem] flex-col items-center gap-1"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-vault-text shadow-[0_10px_24px_rgba(45,49,66,0.12)] transition-transform active:scale-95">
                  <UserPlus className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <span className="whitespace-nowrap text-center text-[10px] font-semibold leading-none text-vault-muted sm:text-[11px]">
                  {t('addMember')}
                </span>
              </button>
              {addDocMember ? (
                <button
                  type="button"
                  data-walkthrough="add-document"
                  aria-label={t('addDocument')}
                  onClick={() => onAddDocument({ memberId: addDocMember.id })}
                  className="flex min-w-[4.25rem] flex-col items-center gap-1"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-vault-text shadow-[0_10px_24px_rgba(45,49,66,0.12)] transition-transform active:scale-95">
                    <FilePlus className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <span className="whitespace-nowrap text-center text-[10px] font-semibold leading-none text-vault-muted sm:text-[11px]">
                    {t('addDocument')}
                  </span>
                </button>
              ) : null}
              <button
                type="button"
                data-walkthrough="search"
                aria-label={t('searchAria')}
                aria-expanded={searchOpen}
                onClick={() => {
                  if (searchOpen) {
                    setSearchOpen(false);
                    setSearchQuery('');
                  } else {
                    setSearchOpen(true);
                  }
                }}
                className="flex min-w-[4.25rem] flex-col items-center gap-1"
              >
                <span
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full text-vault-text shadow-[0_10px_24px_rgba(45,49,66,0.12)] transition-transform active:scale-95',
                    searchOpen ? 'bg-vault-warm/80' : 'bg-white'
                  )}
                >
                  <Search className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <span className="whitespace-nowrap text-center text-[10px] font-semibold leading-none text-vault-muted sm:text-[11px]">
                  {tc('search')}
                </span>
              </button>
                </div>

            {visibleMembers.length > 1 ? (
              <p className="mb-4 flex items-center justify-center gap-1.5 text-[11px] font-medium tracking-wide text-vault-muted">
                <MoveHorizontal className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                {t('swipeCardsHint')}
              </p>
            ) : null}

            <AnimatePresence initial={false}>
              {searchOpen ? (
                      <motion.div
                  key="family-search"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mb-3 overflow-hidden"
                >
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-vault-muted" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('searchPlaceholder')}
                      autoFocus
                      className="w-full rounded-full border border-black/10 bg-white py-2.5 pl-10 pr-10 text-[14px] text-vault-text outline-none placeholder:text-vault-muted focus:ring-2 focus:ring-vault-warm/50"
                    />
                    {searchQuery ? (
                      <button
                        type="button"
                        aria-label={tc('close')}
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-vault-muted"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                          </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {query ? (
              <div className="mb-4">
                <p className="mb-2 text-center text-[12px] font-semibold tracking-wide text-vault-muted">
                  {t('searchResultsHeading', { count: searchHits.length })}
                </p>
                {searchHits.length === 0 ? (
                  <p className="rounded-[20px] bg-white px-4 py-6 text-center text-[13px] text-vault-muted shadow-[0_4px_16px_rgba(33,33,33,0.06)]">
                    {t('noSearchResults')}
                  </p>
                ) : (
                  <ul className="mx-auto max-w-[24rem] space-y-2">
                    {searchHits.map(({ memberId, memberName, match }) => {
                      const cat = getCategoryById(match.document.categoryId);
                      const primaryReason = match.reasons[0];
                      const hintMeta = primaryReason ? getSearchMatchHint(primaryReason) : null;
                      const hint = hintMeta
                        ? t(hintMeta.key as 'searchMatchDocument', hintMeta.values)
                        : '';
                      return (
                        <li key={`${memberId}-${match.document.id}`}>
                          <button
                            type="button"
                            onClick={() => openSearchHit(memberId, match.document.id)}
                            className="w-full rounded-[18px] bg-white px-4 py-3 text-left shadow-[0_4px_16px_rgba(33,33,33,0.06)] ring-1 ring-black/[0.04] transition-transform active:scale-[0.99]"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-[14px] font-bold text-[#212121]">
                                {match.document.title}
                              </p>
                              <ChevronRight
                                className="mt-0.5 h-4 w-4 shrink-0 text-vault-muted"
                                strokeWidth={2}
                              />
                            </div>
                            <p className="mt-0.5 text-[11px] text-vault-muted">
                              {memberName}
                              {cat ? ` · ${cat.shortLabel}` : ''}
                            </p>
                            {hint ? (
                              <p className="mt-1.5 truncate text-[11px] font-medium text-vault-warm">
                                {hint}
                              </p>
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ) : null}

            <div className="member-card-stack overflow-visible">
              {!query && visibleMembers.length === 0 ? (
                <p className="rounded-[20px] bg-white px-4 py-6 text-center text-[13px] text-vault-muted shadow-[0_4px_16px_rgba(33,33,33,0.06)]">
                  {t('noSearchResults')}
                </p>
              ) : !query ? (
                <>
                  <div
                    className="relative mx-auto h-[254px] w-full overflow-visible"
                    style={{ touchAction: 'pan-y' }}
                    onPointerDown={(e) => {
                      (e.currentTarget as HTMLDivElement).dataset.sx = String(e.clientX);
                    }}
                    onPointerUp={(e) => {
                      const start = Number((e.currentTarget as HTMLDivElement).dataset.sx ?? 0);
                      const dx = e.clientX - start;
                      if (dx < -48) stepCarousel(1);
                      else if (dx > 48) stepCarousel(-1);
                    }}
                  >
                    {visibleMembers.map((m, i) => {
                      const focusI = member
                        ? Math.max(0, visibleMembers.findIndex((x) => x.id === member.id))
                        : 0;
                      const offset = wrapOffset(i, focusI, visibleMembers.length);
                      return (
                        <MemberCarouselCard
                          key={m.id}
                          member={m}
                          index={i}
                          total={visibleMembers.length}
                          selected={offset === 0}
                          offset={offset}
                          docCount={documentsByMemberId(m.id).length}
                          categoryCount={
                            new Set(documentsByMemberId(m.id).map((d) => d.categoryId)).size
                          }
                          onSelect={() => {
                            const idx = displayMembers.findIndex((x) => x.id === m.id);
                            if (idx >= 0) navigateTo(idx);
                          }}
                        />
                      );
                    })}
                              </div>
                  {visibleMembers.length > 1 ? (
                    <div className="relative z-[2] mt-3 mb-8 flex justify-center gap-1.5">
                      {visibleMembers.map((m) => (
                                <button
                          key={`dot-${m.id}`}
                                  type="button"
                          aria-label={m.name}
                          onClick={() => {
                            const idx = displayMembers.findIndex((x) => x.id === m.id);
                            if (idx >= 0) {
                              setActiveIndex(idx);
                              setAccentMemberId(m.id);
                            }
                          }}
                                  className={cn(
                            'h-1.5 rounded-full transition-all',
                            member?.id === m.id ? 'w-4 bg-[#212121]' : 'w-1.5 bg-[#212121]/22'
                          )}
                        />
                      ))}
                              </div>
                    ) : null}
                  <AnimatePresence initial={false}>
                    {docsOpen && member ? (
                      <motion.div
                        key={`submenu-${member.id}`}
                        initial={{ opacity: 0, y: -14, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        transition={STACK_SPRING}
                        className="overflow-hidden"
                      >
                        <div className="mx-auto mt-4 w-full max-w-[24rem] rounded-[24px] bg-white/90 p-3 shadow-[0_18px_40px_rgba(15,23,42,0.08)] ring-1 ring-black/[0.04]">
                          {!isDemoMemberId(member.id) ? (
                            <div className="mb-1 flex justify-center">
                  <button
                    type="button"
                                className="min-h-8 px-3 text-center text-[12px] font-semibold text-vault-muted underline decoration-black/20 underline-offset-2"
                    onClick={() => onEditMember(member)}
                  >
                    {tc('edit')}
                  </button>
                </div>
              ) : null}
                          <MemberCategorySection
                            member={member}
                            docs={
                              query &&
                              !member.name.toLowerCase().includes(query) &&
                              !member.relationship.toLowerCase().includes(query)
                                ? documentsByMemberId(member.id).filter((d) =>
                                    documentMatchesSearch(d, query)
                                  )
                                : documentsByMemberId(member.id)
                            }
                            focusDocId={focusDocId}
                            onAddDocument={onAddDocument}
                            onEditDocument={onEditDocument}
                          />
                </div>
                      </motion.div>
              ) : null}
                  </AnimatePresence>
                </>
              ) : null}
              {query && docsOpen && member ? (
                <motion.div
                  key={`search-submenu-${member.id}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={STACK_SPRING}
                  className="mx-auto mt-2 w-full max-w-[24rem] overflow-hidden rounded-[24px] bg-white/90 p-3 shadow-[0_18px_40px_rgba(15,23,42,0.08)] ring-1 ring-black/[0.04]"
                >
                  <MemberCategorySection
                    member={member}
                    docs={documentsByMemberId(member.id).filter(
                      (d) => !query || documentMatchesSearch(d, query) || d.id === focusDocId
                    )}
                    focusDocId={focusDocId}
                    onAddDocument={onAddDocument}
                    onEditDocument={onEditDocument}
                  />
                </motion.div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
