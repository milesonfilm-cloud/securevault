'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { loadVaultDataAsync, saveVaultDataAsync, Document, VaultData } from '@/lib/storage';
import { idbDeletePhotosForDoc } from '@/lib/db';
import CategoryCards from './CategoryCards';
import DocumentList from './DocumentList';
import DocumentFormModal from './DocumentFormModal';
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
    // Also remove any attached photos from IndexedDB
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
  const isPastel = theme === 'pastel';

  if (loading) {
    return (
      <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 rounded-lg w-48 bg-slate-200" />
          <div className="grid gap-3 grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`skel-cat-${i}`} className="h-28 rounded-2xl bg-slate-200" />
            ))}
          </div>
          <div className="h-12 rounded-full bg-slate-200" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`skel-doc-${i}`} className="h-14 rounded-xl bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  const openAdd = () => {
    setEditDoc(null);
    setShowAddModal(true);
  };

  return (
    <div className="max-w-screen-2xl mx-auto p-4 lg:p-6">
      {isPastel ? (
        <>
          <div className="flex items-start justify-between mb-6 gap-4">
            <div>
              <p className="text-sm text-slate-500 font-500">Documents</p>
              <h1 className="text-4xl sm:text-[2.75rem] font-800 text-slate-900 tracking-tight leading-tight mt-0.5">
                Vault
              </h1>
              <p className="text-sm text-slate-500 mt-2">
                {vaultData.documents.length} documents · {vaultData.members.length} family members
              </p>
            </div>
            <button
              type="button"
              onClick={openAdd}
              className="flex-shrink-0 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-700 bg-slate-900 text-white hover:bg-slate-800 transition-all active:scale-[0.98] shadow-md shadow-slate-900/15"
            >
              <Plus size={18} strokeWidth={2.5} />
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

          <div className="rounded-[1.35rem] p-4 mb-4 border border-slate-200/90 bg-white shadow-sm shadow-slate-200/40">
            <div className="flex flex-col gap-3">
              <div className="relative w-full">
                <input
                  id="vault-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search documents, fields, tags..."
                  className="w-full rounded-full border border-slate-200 bg-slate-50/80 text-slate-900 text-sm placeholder:text-slate-400 py-3 pl-11 pr-10 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-shadow"
                />
                <Search
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                {search ? (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
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
                    className={`px-4 py-2 rounded-full text-sm font-600 transition-all duration-150 ${
                      activeMember === null
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All
                  </button>
                  {vaultData.members.map((m) => (
                    <button
                      key={`filter-member-${m.id}`}
                      type="button"
                      onClick={() => setActiveMember(activeMember === m.id ? null : m.id)}
                      className={`px-4 py-2 rounded-full text-sm font-600 transition-all duration-150 ${
                        activeMember === m.id
                          ? 'text-white shadow-md'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      style={activeMember === m.id ? { backgroundColor: m.avatarColor } : {}}
                    >
                      {m.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory(null);
                      setActiveMember(null);
                      setSearch('');
                    }}
                    className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 px-2 transition-colors flex-shrink-0"
                  >
                    <RefreshCw size={13} />
                    Clear
                  </button>
                )}
              </div>

              {activeFiltersCount > 0 && (
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-xs text-slate-500">Showing</span>
                  <span className="text-xs font-700 text-slate-900">
                    {filteredDocuments.length}
                  </span>
                  <span className="text-xs text-slate-500">
                    of {vaultData.documents.length} documents
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}

      {/* Document list */}
      <DocumentList
        documents={filteredDocuments}
        members={vaultData.members}
        uiVariant="pastel"
        onEdit={(doc) => {
          setEditDoc(doc);
          setShowAddModal(true);
        }}
        onDelete={(doc) => setDeleteDoc(doc)}
      />

      {/* Add/Edit modal */}
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

      {/* Delete confirm */}
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
