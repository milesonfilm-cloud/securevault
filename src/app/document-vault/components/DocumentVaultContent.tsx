'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Search, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { loadVaultDataAsync, saveVaultDataAsync, Document, VaultData } from '@/lib/storage';
import { idbDeletePhotosForDoc } from '@/lib/db';
import CategoryCards from './CategoryCards';
import DocumentList from './DocumentList';
import DocumentFormModal from './DocumentFormModal';
import DocumentVaultNotificationStrip from './DocumentVaultNotificationStrip';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useTheme } from '@/context/ThemeContext';

export default function DocumentVaultContent() {
  const [vaultData, setVaultData] = useState<VaultData>({
    members: [],
    documents: [],
    exportHistory: [],
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeMember, setActiveMember] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editDoc, setEditDoc] = useState<Document | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<Document | null>(null);
  /** Notification strip → scroll/highlight document in list */
  const [vaultListNav, setVaultListNav] = useState<{
    docId: string;
    variant: 'critical' | 'warning';
    nonce: number;
  } | null>(null);

  useEffect(() => {
    loadVaultDataAsync().then((data) => {
      setVaultData(data);
      setLoading(false);
    });
  }, []);

  const filteredDocuments = useMemo(() => {
    let docs = vaultData.documents;
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
  }, [vaultData.documents, activeCategory, activeMember, search]);

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

    await saveVaultDataAsync(updated);
    setVaultData(updated);
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
    await saveVaultDataAsync(updated);
    setVaultData(updated);
    toast.success(`"${deleteDoc.title}" deleted from vault`);
    setDeleteDoc(null);
  };

  const activeFiltersCount = [activeCategory, activeMember, search].filter(Boolean).length;
  const { theme } = useTheme();
  const isVault = theme === 'vault';

  const activeMemberProfile = useMemo(
    () => vaultData.members.find((m) => m.id === activeMember) ?? null,
    [vaultData.members, activeMember]
  );

  const openAdd = () => {
    setEditDoc(null);
    setShowAddModal(true);
  };

  const handleVaultNotificationGoToDoc = useCallback(
    (docId: string, variant: 'critical' | 'warning') => {
      setActiveCategory(null);
      setActiveMember(null);
      setSearch('');
      setVaultListNav({ docId, variant, nonce: Date.now() });
    },
    []
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
          <div className="grid gap-3 grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`skel-cat-${i}`} className="h-28 rounded-[20px] bg-vault-panel" />
            ))}
          </div>
          <div className="h-12 rounded-[20px] bg-vault-panel" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`skel-doc-${i}`} className="h-14 rounded-2xl bg-vault-panel" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto p-4 lg:p-6 bg-vault-bg min-h-full">
      {isVault ? (
        <>
          <DocumentVaultNotificationStrip
            documents={vaultData.documents}
            onGoToDocument={handleVaultNotificationGoToDoc}
            onInfoClick={scrollToDocumentList}
          />

          <div className="flex items-start justify-between mb-6 gap-4">
            <div>
              <p className="text-xs text-vault-faint font-medium">Documents</p>
              <h1 className="text-[32px] font-bold text-white tracking-tight leading-tight mt-0.5">
                Vault
              </h1>
              <p className="text-[13px] text-vault-muted mt-2">
                {vaultData.documents.length} documents · {vaultData.members.length} family members
              </p>
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

          <div className="mb-5">
            <CategoryCards
              documents={vaultData.documents}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
            />
          </div>

          <div className="rounded-[20px] p-4 sm:p-5 mb-4 bg-vault-panel border border-[rgba(255,255,255,0.07)] shadow-vault relative z-0">
            <div className="relative z-[1] flex flex-col gap-3">
              <div className="relative w-full">
                <input
                  id="vault-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search documents, fields, tags..."
                  className="w-full rounded-xl border-0 bg-vault-elevated text-white text-sm placeholder:text-vault-faint py-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-vault-warm/40 transition-shadow"
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
                    onClick={() => setActiveMember(null)}
                    className={`px-4 py-1.5 rounded-[20px] text-[13px] font-semibold transition-all duration-150 ${
                      activeMember === null
                        ? 'bg-vault-warm text-vault-ink font-semibold'
                        : 'bg-vault-elevated text-vault-muted border border-[rgba(255,255,255,0.08)] hover:bg-vault-panel'
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
                        onClick={() => setActiveMember(isMemberActive ? null : m.id)}
                        className={`px-4 py-1.5 rounded-[20px] text-[13px] font-semibold transition-all duration-150 border ${
                          isMemberActive
                            ? 'text-white border-transparent shadow-vault'
                            : 'bg-vault-elevated text-vault-muted border-[rgba(255,255,255,0.08)] hover:bg-vault-panel'
                        }`}
                        style={isMemberActive ? { backgroundColor: m.avatarColor } : undefined}
                      >
                        {m.name.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory(null);
                      setActiveMember(null);
                      setSearch('');
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
                  <span className="text-xs font-bold text-white">{filteredDocuments.length}</span>
                  <span className="text-xs text-vault-muted">
                    of {vaultData.documents.length} documents
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}

      <DocumentList
        documents={filteredDocuments}
        members={vaultData.members}
        filterAccentColor={activeMemberProfile?.avatarColor ?? null}
        navigateTo={vaultListNav}
        onNavigateToHandled={() => setVaultListNav(null)}
        onEdit={(doc) => {
          setEditDoc(doc);
          setShowAddModal(true);
        }}
        onDelete={(doc) => setDeleteDoc(doc)}
      />

      <DocumentFormModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditDoc(null);
        }}
        onSave={handleSaveDocument}
        editDoc={editDoc}
        members={vaultData.members}
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
