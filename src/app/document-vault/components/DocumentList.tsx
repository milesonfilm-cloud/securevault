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

export type DocumentListUiVariant = 'light' | 'neon' | 'pastel';

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
  uiVariant = 'light',
}: DocumentListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [maskedFields, setMaskedFields] = useState<Set<string>>(new Set());
  const isNeon = uiVariant === 'neon';
  const isPastel = uiVariant === 'pastel';

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 shadow-lg"
          style={
            isNeon
              ? {
                  background: 'rgba(223,255,79,0.12)',
                  border: '1px solid rgba(223,255,79,0.25)',
                }
              : isPastel
                ? {
                    background: '#EDE8F5',
                    border: '1px solid rgba(74,63,107,0.2)',
                  }
                : {
                    background:
                      'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(99,102,241,0.06) 100%)',
                    border: '1px solid rgba(139,92,246,0.15)',
                  }
          }
        >
          <CreditCard
            size={30}
            className={isNeon ? 'text-[#DFFF4F]' : isPastel ? 'text-[#4A3F6B]' : 'text-violet-400'}
          />
        </div>
        <h3
          className={`text-base font-700 mb-1 ${isNeon ? 'text-white' : isPastel ? 'text-slate-900' : 'text-slate-700'}`}
        >
          No documents yet
        </h3>
        <p
          className={`text-sm max-w-xs ${isNeon ? 'text-zinc-500' : isPastel ? 'text-slate-500' : 'text-slate-400'}`}
        >
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

        const cardStyle = isNeon
          ? {
              background: 'rgba(24,24,24,0.95)',
              border: isExpanded
                ? '1px solid rgba(64,224,208,0.35)'
                : '1px solid rgba(255,255,255,0.08)',
              boxShadow: isExpanded ? '0 0 24px rgba(64,224,208,0.08)' : 'none',
            }
          : isPastel
            ? {
                background: pl.bg,
                border: isExpanded ? `1.5px solid ${pl.accent}50` : `1px solid ${pl.accent}22`,
                boxShadow: isExpanded
                  ? `0 10px 32px ${pl.accent}16`
                  : '0 2px 12px rgba(0,0,0,0.05)',
              }
            : {
                background: 'rgba(255,255,255,0.72)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: isExpanded
                  ? `1px solid ${cat?.color || '#a78bfa'}30`
                  : '1px solid rgba(255,255,255,0.9)',
                boxShadow: isExpanded
                  ? `0 4px 24px ${cat?.color || '#7c3aed'}10`
                  : '0 1px 6px rgba(0,0,0,0.04)',
              };

        const actionButtons = (
          <div
            className="flex items-center gap-1 flex-shrink-0 self-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onEdit(doc)}
              className={
                isNeon
                  ? 'p-1.5 rounded-xl text-zinc-500 hover:text-[#DFFF4F] hover:bg-white/5 transition-colors'
                  : isPastel
                    ? 'p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-black/5 transition-colors'
                    : 'p-1.5 rounded-xl hover:bg-violet-50 text-slate-400 hover:text-violet-600 transition-colors'
              }
              title="Edit document"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => onDelete(doc)}
              className={
                isNeon
                  ? 'p-1.5 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-white/5 transition-colors'
                  : 'p-1.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors'
              }
              title="Delete document — this cannot be undone"
            >
              <Trash2 size={15} />
            </button>
            <div
              className={`p-1.5 ${isNeon ? 'text-zinc-600' : isPastel ? 'text-slate-400' : 'text-slate-300'}`}
            >
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
                  <p className="text-lg font-800 text-[#0a0a0a] leading-snug truncate">{doc.title}</p>
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
            ) : (
              <div
                className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors ${
                  isNeon ? 'hover:bg-white/[0.04]' : 'hover:bg-white/50'
                }`}
                onClick={() => toggleExpand(doc.id)}
              >
                {isNeon ? (
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      color: cat?.color || '#94a3b8',
                    }}
                  >
                    {cat ? ICON_MAP[cat.icon] : <CreditCard size={16} />}
                  </div>
                ) : (
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm"
                    style={{
                      backgroundColor: cat?.color || '#94a3b8',
                      boxShadow: `0 0 6px ${cat?.color || '#94a3b8'}60`,
                    }}
                  />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm font-600 truncate ${isNeon ? 'text-white' : 'text-slate-800'}`}
                    >
                      {doc.title}
                    </span>
                    {cat && (
                      <span
                        className="inline-flex items-center gap-1 text-xs font-500 px-2 py-0.5 rounded-full flex-shrink-0"
                        style={
                          isNeon
                            ? {
                                backgroundColor: 'rgba(255,255,255,0.08)',
                                color: '#e4e4e7',
                                border: '1px solid rgba(255,255,255,0.12)',
                              }
                            : {
                                backgroundColor: `${cat.color}12`,
                                color: cat.color,
                                border: `1px solid ${cat.color}20`,
                              }
                        }
                      >
                        {ICON_MAP[cat.icon]}
                        {cat.shortLabel}
                      </span>
                    )}
                    {member && (
                      <span
                        className="inline-flex items-center gap-1 text-xs font-500 px-2 py-0.5 rounded-full flex-shrink-0 text-white"
                        style={{ backgroundColor: member.avatarColor }}
                      >
                        {member.name.split(' ')[0]}
                      </span>
                    )}
                  </div>
                  {fieldEntries.length > 0 && !isExpanded && (
                    <p
                      className={`text-xs mt-0.5 font-mono truncate ${
                        isNeon ? 'text-zinc-500' : 'text-slate-400'
                      }`}
                    >
                      {fieldEntries[0][0]}: {fieldEntries[0][1]}
                    </p>
                  )}
                </div>

                {actionButtons}
              </div>
            )}

            {isExpanded && (
              <div
                className={`px-4 pb-4 pt-1 animate-slide-up ${
                  isNeon
                    ? 'border-t border-white/[0.08]'
                    : isPastel
                      ? 'border-t border-black/[0.06]'
                      : 'border-t border-slate-100/80'
                }`}
              >
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
                        style={
                          isNeon
                            ? {
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                              }
                            : isPastel
                              ? {
                                  background: 'rgba(255,255,255,0.75)',
                                  border: '1px solid rgba(15,23,42,0.08)',
                                }
                              : {
                                  background: 'rgba(248,247,255,0.8)',
                                  border: '1px solid rgba(139,92,246,0.08)',
                                }
                        }
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`text-xs font-500 ${isNeon ? 'text-zinc-500' : isPastel ? 'text-slate-500' : 'text-slate-400'}`}
                          >
                            {key}
                          </p>
                          <div className="flex items-center gap-2">
                            {canQuickCopy && (
                              <button
                                onClick={() => copyToClipboard(quickCopyLabel, value)}
                            className={
                              isNeon
                                ? 'text-zinc-500 hover:text-[#40E0D0] transition-colors'
                                : isPastel
                                  ? 'text-slate-400 hover:text-slate-800 transition-colors'
                                  : 'text-slate-400 hover:text-slate-700 transition-colors'
                            }
                                title={`Copy ${quickCopyLabel}`}
                              >
                                <Copy size={12} />
                              </button>
                            )}
                            {isSensitive && (
                              <button
                                onClick={() => toggleMask(maskKey)}
                                className={
                                  isNeon
                                    ? 'text-zinc-500 hover:text-[#DFFF4F] transition-colors'
                                    : isPastel
                                      ? 'text-slate-400 hover:text-slate-800 transition-colors'
                                      : 'text-slate-400 hover:text-violet-500 transition-colors'
                                }
                                title={isMasked ? 'Reveal value' : 'Hide value'}
                              >
                                {isMasked ? <EyeOff size={12} /> : <Eye size={12} />}
                              </button>
                            )}
                          </div>
                        </div>
                        <p
                          className={`text-sm font-600 font-mono mt-0.5 break-all ${
                            isNeon ? 'text-zinc-100' : isPastel ? 'text-slate-900' : 'text-slate-800'
                          }`}
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
                      isNeon
                        ? 'mt-2.5 flex items-start gap-2 rounded-xl px-3 py-2 border border-[#FF7F50]/30 bg-[#FF7F50]/10'
                        : isPastel
                          ? 'mt-2.5 flex items-start gap-2 rounded-xl px-3 py-2 border border-amber-200/80 bg-amber-50/90'
                          : 'mt-2.5 flex items-start gap-2 bg-amber-50 rounded-xl px-3 py-2 border border-amber-100'
                    }
                  >
                    <StickyNote
                      size={13}
                      className={`mt-0.5 flex-shrink-0 ${isNeon ? 'text-[#FF7F50]' : 'text-amber-500'}`}
                    />
                    <p className={`text-xs ${isNeon ? 'text-zinc-200' : isPastel ? 'text-amber-900' : 'text-amber-700'}`}>
                      {doc.notes}
                    </p>
                  </div>
                )}

                {doc.tags.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {doc.tags.map((tag) => (
                      <span
                        key={`tag-${doc.id}-${tag}`}
                        className={
                          isNeon
                            ? 'text-xs px-2 py-0.5 rounded-full font-500 border border-[#40E0D0]/35 bg-[#40E0D0]/10 text-[#7eeae0]'
                            : isPastel
                              ? 'text-xs px-2 py-0.5 rounded-full font-500 border border-slate-200 bg-white text-slate-600'
                              : 'text-xs bg-violet-50 text-violet-500 px-2 py-0.5 rounded-full font-500 border border-violet-100'
                        }
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <PhotoAttachments docId={doc.id} />

                <p
                  className={`text-xs mt-2.5 ${isNeon ? 'text-zinc-600' : isPastel ? 'text-slate-400' : 'text-slate-300'}`}
                >
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
