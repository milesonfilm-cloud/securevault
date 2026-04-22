'use client';

import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Landmark,
  Wallet,
  Building2,
  Car,
  Users,
  StickyNote,
  Copy,
  KeyRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { Document, FamilyMember } from '@/lib/storage';
import { getCategoryById } from '@/lib/categories';
import { DEFAULT_EXPIRY_WARN_DAYS, getDocumentExpiryUrgency } from '@/lib/documentExpiry';
import { hexAlpha } from '@/lib/memberAvatarColors';
import PhotoAttachments from './PhotoAttachments';
import { useTheme } from '@/context/ThemeContext';

const ICON_MAP: Record<string, React.ReactNode> = {
  CreditCard: <CreditCard size={16} />,
  Landmark: <Landmark size={16} />,
  Wallet: <Wallet size={16} />,
  Building2: <Building2 size={16} />,
  Car: <Car size={16} />,
  Users: <Users size={16} />,
  KeyRound: <KeyRound size={16} />,
};

interface DocumentListProps {
  documents: Document[];
  members: FamilyMember[];
  /** When a single member filter is active in the vault, accent rows with their profile color */
  filterAccentColor?: string | null;
  /** From notification strip: scroll to row, expand, pulse highlight */
  navigateTo?: {
    docId: string;
    variant: 'critical' | 'warning';
    nonce: number;
  } | null;
  onNavigateToHandled?: () => void;
  onEdit: (doc: Document) => void;
  onDelete: (doc: Document) => void;
}

function getMemberById(members: FamilyMember[], id: string): FamilyMember | undefined {
  return members.find((m) => m.id === id);
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function formatWeekday(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { weekday: 'long' });
  } catch {
    return '';
  }
}

export default function DocumentList({
  documents,
  members,
  filterAccentColor = null,
  navigateTo = null,
  onNavigateToHandled,
  onEdit,
  onDelete,
}: DocumentListProps) {
  const { theme } = useTheme();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [maskedFields, setMaskedFields] = useState<Set<string>>(new Set());
  const [flashRow, setFlashRow] = useState<{
    docId: string;
    variant: 'critical' | 'warning';
  } | null>(null);

  useEffect(() => {
    if (!navigateTo) return;
    const { docId, variant } = navigateTo;
    const found = documents.some((d) => d.id === docId);
    if (!found) {
      toast.warning('That document isn’t visible — filters may still be updating. Try again.');
      onNavigateToHandled?.();
      return;
    }

    setExpandedId(docId);
    setFlashRow({ docId, variant });

    let raf0 = 0;
    let raf1 = 0;
    raf0 = requestAnimationFrame(() => {
      raf1 = requestAnimationFrame(() => {
        document.getElementById(`vault-doc-${docId}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      });
    });

    const clearFlash = window.setTimeout(() => setFlashRow(null), 2800);
    const clearNav = window.setTimeout(() => onNavigateToHandled?.(), 600);

    return () => {
      cancelAnimationFrame(raf0);
      cancelAnimationFrame(raf1);
      window.clearTimeout(clearFlash);
      window.clearTimeout(clearNav);
    };
  }, [navigateTo, documents, onNavigateToHandled]);

  if (documents.length === 0) {
    return (
      <div
        id="vault-document-list"
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 bg-vault-elevated border border-border shadow-vault">
          <CreditCard size={30} className="text-vault-warm" />
        </div>
        <h3 className="text-base font-bold mb-1 text-vault-text">No documents yet</h3>
        <p className="text-sm max-w-xs text-vault-muted">
          Start adding your documents — IDs, bank accounts, cards, and more — all stored privately
          on this device.
        </p>
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const toggleMask = (fieldKey: string) => {
    setMaskedFields((prev) => {
      const next = new Set(prev);
      if (next.has(fieldKey)) next.delete(fieldKey);
      else next.add(fieldKey);
      return next;
    });
  };

  const maskValue = (value: string) => '•'.repeat(Math.min(value.length, 12));

  const copyToClipboard = async (label: string, value: string) => {
    try {
      if (!value) return;
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error('Copy failed — browser permission blocked');
    }
  };

  return (
    <div id="vault-document-list" className="space-y-2">
      {documents.map((doc) => {
        const cat = getCategoryById(doc.categoryId);
        const member = getMemberById(members, doc.memberId);
        const expiryUrgency = getDocumentExpiryUrgency(doc, DEFAULT_EXPIRY_WARN_DAYS);
        const isExpanded = expandedId === doc.id;
        const fieldEntries = Object.entries(doc.fields);
        const isFlash = flashRow?.docId === doc.id;
        const flashClass =
          isFlash && flashRow.variant === 'critical'
            ? 'ring-2 ring-red-500 shadow-[0_0_28px_rgba(239,68,68,0.5)] border-red-500/60 z-[2]'
            : isFlash && flashRow.variant === 'warning'
              ? 'ring-2 ring-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.4)] border-amber-400/50 z-[2]'
              : '';

        const actionButtons = (
          <div
            className="flex items-center gap-1 flex-shrink-0 self-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onEdit(doc)}
              className="p-1.5 rounded-[10px] text-vault-faint hover:text-vault-warm hover:bg-white/[0.05] transition-colors"
              title="Edit document"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => onDelete(doc)}
              className="p-1.5 rounded-[10px] text-vault-faint hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Delete document — this cannot be undone"
            >
              <Trash2 size={16} />
            </button>
            <div className="p-1.5 text-vault-faint">
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
        );

        return (
          <div
            id={`vault-doc-${doc.id}`}
            key={`doc-item-${doc.id}`}
            className={`rounded-2xl overflow-hidden transition-all duration-200 relative z-0 bg-vault-panel border border-border ${
              theme === 'pastel'
                ? 'shadow-pastel-card'
                : theme === 'neon'
                  ? 'shadow-[0_12px_40px_rgba(0,0,0,0.55)] ring-1 ring-[rgba(0,255,65,0.16)]'
                  : 'shadow-vault'
            } ${
              filterAccentColor ? 'border-l-[3px]' : ''
            } ${flashClass}`}
            style={filterAccentColor ? { borderLeftColor: filterAccentColor } : undefined}
          >
            <div
              className="relative z-[1] flex items-start gap-3 px-5 py-4 cursor-pointer transition-colors hover:bg-vault-elevated/50"
              onClick={() => toggleExpand(doc.id)}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border border-border"
                style={{
                  backgroundColor: cat
                    ? hexAlpha(cat.color, 0.2)
                    : 'color-mix(in srgb, var(--vault-c-elevated) 88%, var(--vault-c-warm) 12%)',
                  color: cat?.color ?? 'var(--vault-c-warm)',
                }}
              >
                {cat ? ICON_MAP[cat.icon] : <CreditCard size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                {cat && (
                  <p
                    className="text-[10px] font-bold uppercase tracking-[1.5px] leading-tight"
                    style={{ color: cat.color }}
                  >
                    {cat.shortLabel}
                  </p>
                )}
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <p className="text-[15px] font-semibold text-vault-text leading-snug truncate">
                    {doc.title}
                  </p>
                  {expiryUrgency === 'expired' && (
                    <span className="shrink-0 text-[9px] font-800 uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/25 text-red-200 border border-red-400/30">
                      Expired
                    </span>
                  )}
                  {expiryUrgency === 'soon' && (
                    <span className="shrink-0 text-[9px] font-800 uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-100 border border-amber-400/25">
                      Expiring
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap mt-1.5">
                  {member && (
                    <span
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-[20px] text-white"
                      style={{
                        backgroundColor: hexAlpha(member.avatarColor, 0.4),
                        border: `1px solid ${hexAlpha(member.avatarColor, 0.65)}`,
                      }}
                    >
                      {member.photoDataUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={member.photoDataUrl}
                          alt=""
                          className="h-4 w-4 shrink-0 rounded-full object-cover ring-1 ring-white/25"
                        />
                      ) : null}
                      {member.name.split(' ')[0]}
                    </span>
                  )}
                  {fieldEntries.length > 0 && !isExpanded && (
                    <p className="text-xs font-mono truncate text-vault-muted">
                      {fieldEntries[0][0]}: {fieldEntries[0][1]}
                    </p>
                  )}
                </div>
              </div>
              <div className="hidden sm:block text-right pt-0.5 flex-shrink-0 min-w-[4.5rem]">
                <p className="text-xs font-semibold leading-tight text-vault-muted">
                  {formatWeekday(doc.updatedAt)}
                </p>
                <p className="text-[11px] text-vault-faint leading-tight mt-0.5">
                  {formatDate(doc.updatedAt)}
                </p>
              </div>
              {actionButtons}
            </div>

            {isExpanded && (
              <div className="relative z-[1] px-5 pb-4 pt-1 animate-slide-up border-t border-border">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {fieldEntries.map(([key, value]) => {
                    const catField = cat?.fields.find((f) => f.key === key);
                    const isSensitive = catField?.sensitive;
                    const maskKey = `${doc.id}-${key}`;
                    const isMasked = isSensitive && !maskedFields.has(maskKey);
                    const isPasswordDoc = doc.categoryId === 'password-vault';
                    const canQuickCopy =
                      isPasswordDoc && (key === 'User ID / Email' || key === 'Password');
                    const quickCopyLabel = key === 'Password' ? 'Password' : 'User ID';

                    return (
                      <div
                        key={`field-${doc.id}-${key}`}
                        className="neo-inset rounded-xl px-3 py-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-medium text-vault-muted">{key}</p>
                          <div className="flex items-center gap-2">
                            {canQuickCopy && (
                              <button
                                onClick={() => copyToClipboard(quickCopyLabel, value)}
                                className="text-vault-faint hover:text-vault-warm transition-colors"
                                title={`Copy ${quickCopyLabel}`}
                              >
                                <Copy size={12} />
                              </button>
                            )}
                            {isSensitive && (
                              <button
                                onClick={() => toggleMask(maskKey)}
                                className="text-vault-faint hover:text-vault-warm transition-colors"
                                title={isMasked ? 'Reveal value' : 'Hide value'}
                              >
                                {isMasked ? <EyeOff size={12} /> : <Eye size={12} />}
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm font-bold font-mono mt-0.5 break-all text-vault-text">
                          {isMasked ? maskValue(value) : value}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {doc.notes && (
                  <div className="mt-2.5 flex items-start gap-2 rounded-xl px-3 py-2 border border-border bg-vault-elevated">
                    <StickyNote size={13} className="mt-0.5 flex-shrink-0 text-vault-warm" />
                    <p className="text-xs text-vault-muted">{doc.notes}</p>
                  </div>
                )}

                {doc.tags.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {doc.tags.map((tag) => (
                      <span
                        key={`tag-${doc.id}-${tag}`}
                        className="neo-pill text-xs px-2.5 py-1 rounded-full font-bold bg-vault-elevated text-vault-muted border border-border"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <PhotoAttachments docId={doc.id} />

                <p className="text-xs mt-2.5 text-vault-faint">
                  Updated {formatDate(doc.updatedAt)}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
