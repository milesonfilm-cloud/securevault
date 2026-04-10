'use client';

import React, { useState } from 'react';
import {
  X,
  Eye,
  EyeOff,
  CreditCard,
  Landmark,
  Wallet,
  Building2,
  Car,
  Users,
  KeyRound,
} from 'lucide-react';
import { FamilyMember, Document } from '@/lib/storage';
import { CATEGORIES } from '@/lib/categories';
import { hexAlpha } from '@/lib/memberAvatarColors';

const ICON_MAP: Record<string, React.ReactNode> = {
  CreditCard: <CreditCard size={16} />,
  Landmark: <Landmark size={16} />,
  Wallet: <Wallet size={16} />,
  Building2: <Building2 size={16} />,
  Car: <Car size={16} />,
  Users: <Users size={16} />,
  KeyRound: <KeyRound size={16} />,
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
    <div className="neo-card rounded-2xl h-full flex flex-col animate-slide-up">
      {/* Panel header */}
      <div
        className="flex items-center justify-between p-5 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-800 text-sm shadow-vault"
            style={{ backgroundColor: member.avatarColor }}
          >
            {initials}
          </div>
          <div>
            <h3 className="text-base font-700 text-white">{member.name}</h3>
            <p className="text-xs text-vault-muted">
              {documents.length} documents · {member.relationship}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-[10px] text-vault-faint hover:text-vault-warm hover:bg-white/[0.05] transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Documents by category */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {categoriesWithDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 bg-vault-elevated rounded-xl flex items-center justify-center mb-3 border border-[rgba(255,255,255,0.07)]">
              <CreditCard size={20} className="text-vault-warm" />
            </div>
            <p className="text-sm font-600 text-vault-muted mb-1">No documents for {member.name}</p>
            <p className="text-xs text-vault-faint">
              Add documents from the Document Vault and assign them to this member.
            </p>
          </div>
        ) : (
          categoriesWithDocs.map(({ cat, docs }) => (
            <div key={`panel-cat-${member.id}-${cat.id}`}>
              <div className="flex items-center gap-2 mb-2.5">
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center border border-[rgba(255,255,255,0.08)]"
                  style={{
                    backgroundColor: hexAlpha(cat.color, 0.2),
                    color: cat.color,
                  }}
                >
                  {ICON_MAP[cat.icon]}
                </div>
                <span className="text-sm font-800 text-white">{cat.label}</span>
                <span className="text-xs font-800 px-2 py-1 rounded-full bg-vault-elevated border border-[rgba(255,255,255,0.07)] text-vault-muted">
                  {docs.length}
                </span>
              </div>

              <div className="space-y-2 pl-9">
                {docs.map((doc) => (
                  <div
                    key={`panel-doc-${member.id}-${doc.id}`}
                    className="neo-inset rounded-2xl p-3"
                  >
                    <p className="text-sm font-600 text-white mb-2">{doc.title}</p>
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
                              <span className="text-xs text-vault-muted flex-shrink-0">{key}</span>
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-700 text-vault-muted font-mono">
                                  {isSensitive && !isRevealed
                                    ? '•'.repeat(Math.min(value.length, 10))
                                    : value}
                                </span>
                                {isSensitive && (
                                  <button
                                    onClick={() => toggleReveal(revKey)}
                                    className="text-vault-faint hover:text-vault-warm transition-colors"
                                  >
                                    {isRevealed ? <EyeOff size={11} /> : <Eye size={11} />}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                    {doc.notes && (
                      <p className="text-xs text-vault-faint mt-2 italic">{doc.notes}</p>
                    )}
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
