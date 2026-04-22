'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Search, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Document, VaultData, CategoryId } from '@/lib/storage';
import { useVaultData } from '@/context/VaultDataContext';
import { idbDeletePhotosForDoc } from '@/lib/db';
import CategoryCards from './CategoryCards';
import DocumentList from './DocumentList';
import DocumentFormModal from './DocumentFormModal';
import DocumentVaultNotificationStrip from './DocumentVaultNotificationStrip';
import VaultDashboardStats from './VaultDashboardStats';
import type { DocumentPrefill } from '@/lib/ocr/documentPrefill';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { documentMatchesStack, stackColorFromId } from '@/lib/documentStacks';

export default function DocumentVaultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stackId = searchParams.get('stack');

  const { vaultData, loading, persistVaultData } = useVaultData();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formPrefill, setFormPrefill] = useState<DocumentPrefill | null>(null);
  const [editDoc, setEditDoc] = useState<Document | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<Document | null>(null);
  /** Notification strip → scroll/highlight document in list */
  const [vaultListNav, setVaultListNav] = useState<{
    docId: string;
    variant: 'critical' | 'warning';
    nonce: number;
  } | null>(null);

  const activeStack = useMemo(() => {
    if (!stackId) return null;
    return vaultData.documentStacks.find((s) => s.id === stackId) ?? null;
  }, [stackId, vaultData.documentStacks]);

  const activeStackFolderColor = useMemo(
    () => (activeStack ? stackColorFromId(activeStack.id) : null),
    [activeStack]
  );

  const sortedFolders = useMemo(
    () => [...vaultData.documentStacks].sort((a, b) => a.sortOrder - b.sortOrder),
    [vaultData.documentStacks]
  );

  const defaultStackIdForForm = useMemo((): string | null => {
    if (!stackId) return null;
    return vaultData.documentStacks.some((s) => s.id === stackId) ? stackId : null;
  }, [stackId, vaultData.documentStacks]);

  const memberParam = searchParams.get('member');
  const activeMember = useMemo((): string | null => {
    if (!memberParam) return null;
    return vaultData.members.some((m) => m.id === memberParam) ? memberParam : null;
  }, [memberParam, vaultData.members]);

  const setMemberFilter = useCallback(
    (id: string | null) => {
      const p = new URLSearchParams(searchParams.toString());
      if (id) p.set('member', id);
      else p.delete('member');
      const qs = p.toString();
      router.replace(qs ? `/document-vault?${qs}` : '/document-vault', { scroll: false });
    },
    [router, searchParams]
  );

  const stackFilteredDocuments = useMemo(() => {
    if (!activeStack) return vaultData.documents;
    return vaultData.documents.filter((d) => documentMatchesStack(d, activeStack));
  }, [vaultData.documents, activeStack]);

  const filteredDocuments = useMemo(() => {
    let docs = stackFilteredDocuments;
    if (activeCategory) docs = docs.filter((d) => d.categoryId === activeCategory);
    if (activeMember) docs = docs.filter((d) => d.memberId === activeMember);
    if (search.trim()) {
      const q = search.toLowerCase();
      docs = docs.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.categoryId.includes(q) ||
          d.notes.toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q)) ||
          Object.values(d.fields).some((v) => v.toLowerCase().includes(q))
      );
    }
    return docs;
  }, [stackFilteredDocuments, activeCategory, activeMember, search]);

  const handleSaveDocument = async (docData: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    let updated: VaultData;

    if (editDoc) {
      const updatedDoc: Document = {
        ...editDoc,
        ...docData,
        updatedAt: now,
      };
      updated = {
        ...vaultData,
        documents: vaultData.documents.map((d) => (d.id === editDoc.id ? updatedDoc : d)),
      };
      toast.success(`"${updatedDoc.title}" updated successfully`);
    } else {
      const newDoc: Document = {
        id: `doc-${Date.now()}`,
        ...docData,
        createdAt: now,
        updatedAt: now,
      };
      updated = {
        ...vaultData,
        documents: [...vaultData.documents, newDoc],
      };
      toast.success(`"${newDoc.title}" added to vault`);
    }

    await persistVaultData(updated);
    setShowAddModal(false);
    setEditDoc(null);
  };

  const handleDeleteDocument = async () => {
    if (!deleteDoc) return;
    await idbDeletePhotosForDoc(deleteDoc.id);
    const updated: VaultData = {
      ...vaultData,
      documents: vaultData.documents.filter((d) => d.id !== deleteDoc.id),
    };
    await persistVaultData(updated);
    toast.success(`"${deleteDoc.title}" deleted from vault`);
    setDeleteDoc(null);
  };

  const { theme } = useTheme();
  const isVault =
    theme === 'vault' ||
    theme === 'wellness' ||
    theme === 'neon' ||
    theme === 'pastel' ||
    theme === 'voyager';

  const activeFiltersCount = [activeCategory, activeMember, search, stackId].filter(Boolean).length;

  const activeMemberProfile = useMemo(
    () => vaultData.members.find((m) => m.id === activeMember) ?? null,
    [vaultData.members, activeMember]
  );

  const openAdd = () => {
    setEditDoc(null);
    setFormPrefill(null);
    setShowAddModal(true);
  };

  const handleVaultNotificationGoToDoc = useCallback(
    (docId: string, variant: 'critical' | 'warning') => {
      setActiveCategory(null);
      setSearch('');
      router.push('/document-vault');
      setVaultListNav({ docId, variant, nonce: Date.now() });
    },
    [router]
  );

  const scrollToDocumentList = useCallback(() => {
    document
      .getElementById('vault-document-list')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 rounded-[10px] w-48 bg-vault-elevated" />
          <div className="h-12 rounded-[20px] bg-vault-panel" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`skel-doc-${i}`} className="h-14 rounded-2xl bg-vault-panel" />
          ))}
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`skel-cat-${i}`} className="h-28 rounded-[20px] bg-vault-panel" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto p-4 lg:p-6 min-h-full bg-vault-bg">
      {isVault ? (
        <>
          <DocumentVaultNotificationStrip
            documents={vaultData.documents}
            onGoToDocument={handleVaultNotificationGoToDoc}
            onInfoClick={scrollToDocumentList}
          />

          {activeStack ? (
            <div
              className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 shadow-[var(--vault-shadow)]"
              style={
                theme === 'pastel'
                  ? {
                      borderColor: 'var(--color-border)',
                      background: `linear-gradient(135deg, ${activeStackFolderColor}30, rgba(255,255,255,0.94))`,
                    }
                  : {
                      borderColor: `${activeStackFolderColor}55`,
                      background: `linear-gradient(135deg, ${activeStackFolderColor}14, rgba(18,18,18,0.85))`,
                    }
              }
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-vault-faint">
                  Folder filter
                </p>
                <p className="text-sm font-semibold text-vault-text">{activeStack.name}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push('/document-vault')}
                  className="rounded-xl bg-vault-warm px-3 py-1.5 text-xs font-bold text-vault-ink"
                >
                  Clear folder
                </button>
              </div>
            </div>
          ) : null}

          <div className="flex items-start justify-between mb-5 gap-4">
            <div>
              <p className="text-xs text-vault-faint font-medium">Documents</p>
              <h1 className="text-[32px] font-bold text-vault-text tracking-tight leading-tight mt-0.5">
                Vault
              </h1>
              <p className="text-[13px] text-vault-muted mt-2">
                <span className="font-semibold tabular-nums text-vault-text">
                  {vaultData.documents.length}
                </span>{' '}
                total documents ·{' '}
                <span className="font-semibold tabular-nums text-vault-text">
                  {vaultData.members.length}
                </span>{' '}
                family members
              </p>
              {activeStack ? (
                <p className="mt-1 text-[12px] text-vault-faint">
                  Showing documents in this folder only:{' '}
                  <span className="font-semibold tabular-nums text-vault-muted">
                    {stackFilteredDocuments.length}
                  </span>{' '}
                  of {vaultData.documents.length} total in vault
                </p>
              ) : null}
              {activeMemberProfile ? (
                <p className="mt-1.5 text-[12px] text-vault-faint">
                  Showing documents for{' '}
                  <span className="font-semibold text-vault-muted">{activeMemberProfile.name}</span>
                  .{' '}
                  <button
                    type="button"
                    onClick={() => setMemberFilter(null)}
                    className="font-semibold text-vault-warm underline-offset-2 hover:underline"
                  >
                    Show all members
                  </button>
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={openAdd}
              className="flex-shrink-0 flex items-center gap-2 rounded-xl py-2.5 px-5 text-sm font-semibold bg-vault-warm text-vault-ink transition-all active:scale-[0.98] shadow-vault"
            >
              <Plus size={18} strokeWidth={2.5} className="text-vault-ink" />
              Add
            </button>
          </div>

          <VaultDashboardStats vaultData={vaultData} />

          <div className="rounded-[20px] p-4 sm:p-5 mb-4 bg-vault-panel border border-[color:var(--color-border)] shadow-vault relative z-0">
            <div className="relative z-[1] flex flex-col gap-3">
              <div className="relative w-full">
                <input
                  id="vault-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search documents, fields, tags..."
                  className="w-full rounded-xl border-0 bg-vault-elevated text-vault-text text-sm placeholder:text-vault-faint py-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-vault-warm/40 transition-shadow"
                />
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-vault-faint pointer-events-none"
                />
                {search ? (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-vault-faint hover:text-vault-warm p-1"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                ) : null}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
                <div className="flex gap-2 flex-wrap flex-1">
                  <button
                    type="button"
                    onClick={() => setMemberFilter(null)}
                    className={`px-4 py-1.5 rounded-[20px] text-[13px] font-semibold transition-all duration-150 ${
                      activeMember === null
                        ? 'bg-vault-warm text-vault-ink font-semibold'
                        : 'bg-vault-elevated text-vault-muted border border-border hover:bg-vault-panel'
                    }`}
                  >
                    All
                  </button>
                  {vaultData.members.map((m) => {
                    const isMemberActive = activeMember === m.id;
                    return (
                      <button
                        key={`filter-member-${m.id}`}
                        type="button"
                        onClick={() => setMemberFilter(isMemberActive ? null : m.id)}
                        className={`inline-flex max-w-[200px] items-center gap-2 px-4 py-1.5 rounded-[20px] text-[13px] font-semibold transition-all duration-150 border ${
                          isMemberActive
                            ? m.photoDataUrl
                              ? 'bg-vault-elevated text-vault-warm border-vault-warm/50 shadow-vault ring-1 ring-vault-warm/35'
                              : 'text-white border-transparent shadow-vault'
                            : 'bg-vault-elevated text-vault-muted border border-border hover:bg-vault-panel'
                        }`}
                        style={
                          isMemberActive && !m.photoDataUrl ? { backgroundColor: m.avatarColor } : undefined
                        }
                      >
                        {m.photoDataUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={m.photoDataUrl}
                            alt=""
                            className="h-6 w-6 shrink-0 rounded-full object-cover ring-1 ring-white/20"
                          />
                        ) : null}
                        <span className="truncate">{m.name.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory(null);
                      setSearch('');
                      router.push('/document-vault');
                    }}
                    className="flex items-center gap-1.5 text-sm text-vault-muted hover:text-vault-warm px-2 transition-colors flex-shrink-0"
                  >
                    <RefreshCw size={13} />
                    Clear
                  </button>
                )}
              </div>

              {activeFiltersCount > 0 && (
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-xs text-vault-muted">Showing</span>
                  <span className="text-xs font-bold text-vault-text">
                    {filteredDocuments.length}
                  </span>
                  <span className="text-xs text-vault-muted">
                    of {stackFilteredDocuments.length} documents
                  </span>
                </div>
              )}
            </div>
          </div>

          <DocumentList
            documents={filteredDocuments}
            members={vaultData.members}
            filterAccentColor={activeMemberProfile?.avatarColor ?? null}
            navigateTo={vaultListNav}
            onNavigateToHandled={() => setVaultListNav(null)}
            onEdit={(doc) => {
              setFormPrefill(null);
              setEditDoc(doc);
              setShowAddModal(true);
            }}
            onDelete={(doc) => setDeleteDoc(doc)}
          />

          <div className="mt-8 border-t border-[color:var(--color-border)] pt-6">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-vault-muted">
              Filter by category
            </p>
            <CategoryCards
              documents={stackFilteredDocuments}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
            />
          </div>
        </>
      ) : null}

      <DocumentFormModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditDoc(null);
          setFormPrefill(null);
        }}
        onSave={handleSaveDocument}
        editDoc={editDoc}
        members={vaultData.members}
        folders={sortedFolders}
        defaultStackId={editDoc ? undefined : defaultStackIdForForm}
        prefill={editDoc ? null : formPrefill}
      />

      <ConfirmModal
        isOpen={!!deleteDoc}
        onClose={() => setDeleteDoc(null)}
        onConfirm={handleDeleteDocument}
        title="Delete Document"
        description={`Remove "${deleteDoc?.title}" from the vault? This cannot be undone.`}
        confirmLabel="Delete Document"
        isDanger
      />
    </div>
  );
}
