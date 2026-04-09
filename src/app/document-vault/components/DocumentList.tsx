'use client';

import React, { useState } from 'react';
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
import { CATEGORIES, getCategoryById } from '@/lib/categories';
import { getPastelLedgerTile } from '@/lib/pastelLedgerPalette';
import PhotoAttachments from './PhotoAttachments';

const ICON_MAP: Record<string, React.ReactNode> = {
  CreditCard: <CreditCard size={14} />,
  Landmark: <Landmark size={14} />,
  Wallet: <Wallet size={14} />,
  Building2: <Building2 size={14} />,
  Car: <Car size={14} />,
  Users: <Users size={14} />,
  KeyRound: <KeyRound size={14} />,
};

export type DocumentListUiVariant = 'pastel';

interface DocumentListProps {
  documents: Document[];
  members: FamilyMember[];
  onEdit: (doc: Document) => void;
  onDelete: (doc: Document) => void;
  uiVariant?: DocumentListUiVariant;
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
  onEdit,
  onDelete,
  uiVariant = 'pastel',
}: DocumentListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [maskedFields, setMaskedFields] = useState<Set<string>>(new Set());
  const isPastel = uiVariant === 'pastel';

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 shadow-lg"
          style={{
            background: '#EDE8F5',
            border: '1px solid rgba(74,63,107,0.2)',
          }}
        >
          <CreditCard size={30} className="text-[#4A3F6B]" />
        </div>
        <h3 className="text-base font-700 mb-1 text-slate-900">No documents yet</h3>
        <p className="text-sm max-w-xs text-slate-500">
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
    <div className="space-y-2">
      {documents.map((doc) => {
        const cat = getCategoryById(doc.categoryId);
        const member = getMemberById(members, doc.memberId);
        const isExpanded = expandedId === doc.id;
        const fieldEntries = Object.entries(doc.fields);
        const catIdx = CATEGORIES.findIndex((c) => c.id === doc.categoryId);
        const pl = getPastelLedgerTile(catIdx >= 0 ? catIdx : 0);

        const cardStyle = isPastel
          ? {
              background: pl.bg,
              border: isExpanded ? `1.5px solid ${pl.accent}50` : `1px solid ${pl.accent}22`,
              boxShadow: isExpanded ? `0 10px 32px ${pl.accent}16` : '0 2px 12px rgba(0,0,0,0.05)',
            }
          : {
              background: pl.bg,
              border: isExpanded ? `1.5px solid ${pl.accent}50` : `1px solid ${pl.accent}22`,
              boxShadow: isExpanded ? `0 10px 32px ${pl.accent}16` : '0 2px 12px rgba(0,0,0,0.05)',
            };

        const actionButtons = (
          <div
            className="flex items-center gap-1 flex-shrink-0 self-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onEdit(doc)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-black/5 transition-colors"
              title="Edit document"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => onDelete(doc)}
              className={
                'p-1.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors'
              }
              title="Delete document — this cannot be undone"
            >
              <Trash2 size={15} />
            </button>
            <div className="p-1.5 text-slate-400">
              {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </div>
          </div>
        );

        return (
          <div
            key={`doc-item-${doc.id}`}
            className={`${isPastel ? 'rounded-[1.35rem]' : 'rounded-2xl'} overflow-hidden transition-all duration-200`}
            style={cardStyle}
          >
            {/* Row header */}
            {isPastel ? (
              <div
                className="flex items-start gap-3 px-4 py-4 cursor-pointer transition-colors hover:bg-black/[0.03]"
                onClick={() => toggleExpand(doc.id)}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'rgba(0,0,0,0.07)',
                    color: pl.accent,
                  }}
                >
                  {cat ? ICON_MAP[cat.icon] : <CreditCard size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  {cat && (
                    <p
                      className="text-[11px] font-700 uppercase tracking-wide leading-tight"
                      style={{ color: pl.accent }}
                    >
                      {cat.shortLabel}
                    </p>
                  )}
                  <p className="text-lg font-800 text-[#0a0a0a] leading-snug truncate">
                    {doc.title}
                  </p>
                  {member && (
                    <span
                      className="inline-flex items-center gap-1 text-[11px] font-600 px-2 py-0.5 rounded-full mt-1.5 text-white"
                      style={{ backgroundColor: member.avatarColor }}
                    >
                      {member.name.split(' ')[0]}
                    </span>
                  )}
                  {fieldEntries.length > 0 && !isExpanded && (
                    <p className="text-xs mt-1.5 font-mono truncate text-slate-500">
                      {fieldEntries[0][0]}: {fieldEntries[0][1]}
                    </p>
                  )}
                </div>
                <div className="hidden sm:block text-right pt-0.5 flex-shrink-0 min-w-[4.5rem]">
                  <p className="text-xs font-600 leading-tight" style={{ color: pl.accent }}>
                    {formatWeekday(doc.updatedAt)}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    {formatDate(doc.updatedAt)}
                  </p>
                </div>
                {actionButtons}
              </div>
            ) : null}

            {isExpanded && (
              <div className={`px-4 pb-4 pt-1 animate-slide-up ${'border-t border-black/[0.06]'}`}>
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
                        className="rounded-xl px-3 py-2"
                        style={{
                          background: 'rgba(255,255,255,0.75)',
                          border: '1px solid rgba(15,23,42,0.08)',
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-500 text-slate-500">{key}</p>
                          <div className="flex items-center gap-2">
                            {canQuickCopy && (
                              <button
                                onClick={() => copyToClipboard(quickCopyLabel, value)}
                                className="text-slate-400 hover:text-slate-800 transition-colors"
                                title={`Copy ${quickCopyLabel}`}
                              >
                                <Copy size={12} />
                              </button>
                            )}
                            {isSensitive && (
                              <button
                                onClick={() => toggleMask(maskKey)}
                                className="text-slate-400 hover:text-slate-800 transition-colors"
                                title={isMasked ? 'Reveal value' : 'Hide value'}
                              >
                                {isMasked ? <EyeOff size={12} /> : <Eye size={12} />}
                              </button>
                            )}
                          </div>
                        </div>
                        <p
                          className={`text-sm font-600 font-mono mt-0.5 break-all ${'text-slate-900'}`}
                        >
                          {isMasked ? maskValue(value) : value}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {doc.notes && (
                  <div
                    className={
                      'mt-2.5 flex items-start gap-2 rounded-xl px-3 py-2 border border-amber-200/80 bg-amber-50/90'
                    }
                  >
                    <StickyNote size={13} className="mt-0.5 flex-shrink-0 text-amber-500" />
                    <p className="text-xs text-amber-900">{doc.notes}</p>
                  </div>
                )}

                {doc.tags.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {doc.tags.map((tag) => (
                      <span
                        key={`tag-${doc.id}-${tag}`}
                        className="text-xs px-2 py-0.5 rounded-full font-500 border border-slate-200 bg-white text-slate-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <PhotoAttachments docId={doc.id} />

                <p className="text-xs mt-2.5 text-slate-400">Updated {formatDate(doc.updatedAt)}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
