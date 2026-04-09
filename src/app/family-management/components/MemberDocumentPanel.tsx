'use client';

import React, { useState } from 'react';
import { X, Eye, EyeOff, CreditCard, Landmark, Wallet, Building2, Car, Users } from 'lucide-react';
import { FamilyMember, Document } from '@/lib/storage';
import { CATEGORIES } from '@/lib/categories';

const ICON_MAP: Record<string, React.ReactNode> = {
  CreditCard: <CreditCard size={16} />,
  Landmark: <Landmark size={16} />,
  Wallet: <Wallet size={16} />,
  Building2: <Building2 size={16} />,
  Car: <Car size={16} />,
  Users: <Users size={16} />,
};

interface MemberDocumentPanelProps {
  member: FamilyMember;
  documents: Document[];
  onClose: () => void;
}

export default function MemberDocumentPanel({
  member,
  documents,
  onClose,
}: MemberDocumentPanelProps) {
  const [revealedFields, setRevealedFields] = useState<Set<string>>(new Set());

  const toggleReveal = (key: string) => {
    setRevealedFields((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const categoriesWithDocs = CATEGORIES.map((cat) => ({
    cat,
    docs: documents.filter((d) => d.categoryId === cat.id),
  })).filter((x) => x.docs.length > 0);

  const initials = member.name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="bg-white rounded-[1.35rem] border border-slate-200/80 shadow-[0_12px_36px_rgba(15,23,42,0.12)] h-full flex flex-col animate-slide-up">
      {/* Panel header */}
      <div className="flex items-center justify-between p-5 border-b border-black/[0.06] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-700 text-sm"
            style={{ backgroundColor: member.avatarColor }}
          >
            {initials}
          </div>
          <div>
            <h3 className="text-base font-700 text-slate-900">{member.name}</h3>
            <p className="text-xs text-slate-400">
              {documents.length} documents · {member.relationship}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-black/5 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Documents by category */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {categoriesWithDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
              <CreditCard size={20} className="text-slate-400" />
            </div>
            <p className="text-sm font-600 text-slate-600 mb-1">No documents for {member.name}</p>
            <p className="text-xs text-slate-400">
              Add documents from the Document Vault and assign them to this member.
            </p>
          </div>
        ) : (
          categoriesWithDocs.map(({ cat, docs }) => (
            <div key={`panel-cat-${member.id}-${cat.id}`}>
              <div className="flex items-center gap-2 mb-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(0,0,0,0.06)', color: '#0f172a' }}
                >
                  {ICON_MAP[cat.icon]}
                </div>
                <span className="text-sm font-800 text-slate-900">{cat.label}</span>
                <span className="text-xs font-700 px-1.5 py-0.5 rounded-full bg-black/5 text-slate-700">
                  {docs.length}
                </span>
              </div>

              <div className="space-y-2 pl-9">
                {docs.map((doc) => (
                  <div
                    key={`panel-doc-${member.id}-${doc.id}`}
                    className="bg-white/75 rounded-xl p-3 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
                  >
                    <p className="text-sm font-600 text-slate-800 mb-2">{doc.title}</p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {Object.entries(doc.fields)
                        .slice(0, 4)
                        .map(([key, value]) => {
                          const catField = cat.fields.find((f) => f.key === key);
                          const isSensitive = catField?.sensitive;
                          const revKey = `${doc.id}-${key}`;
                          const isRevealed = revealedFields.has(revKey);

                          return (
                            <div
                              key={`panel-field-${doc.id}-${key}`}
                              className="flex items-center justify-between gap-2"
                            >
                              <span className="text-xs text-slate-400 flex-shrink-0">{key}</span>
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-600 text-slate-700 font-mono">
                                  {isSensitive && !isRevealed
                                    ? '•'.repeat(Math.min(value.length, 10))
                                    : value}
                                </span>
                                {isSensitive && (
                                  <button
                                    onClick={() => toggleReveal(revKey)}
                                    className="text-slate-300 hover:text-slate-500 transition-colors"
                                  >
                                    {isRevealed ? <EyeOff size={11} /> : <Eye size={11} />}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                    {doc.notes && <p className="text-xs text-slate-400 mt-2 italic">{doc.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
