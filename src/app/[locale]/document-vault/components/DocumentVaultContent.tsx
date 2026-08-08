'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { Crown, Plus, Search, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Document, VaultData, type CategoryId } from '@/lib/storage';
import { useVaultData } from '@/context/VaultDataContext';
import { idbDeletePhotosForDoc } from '@/lib/db';
import CategoryCards from './CategoryCards';
import DocumentList from './DocumentList';
import DocumentFormModal from './DocumentFormModal';
import DocumentVaultNotificationStrip from './DocumentVaultNotificationStrip';
import VaultDashboardStats from './VaultDashboardStats';
import type { DocumentPrefill } from '@/lib/ocr/documentPrefill';
import ConfirmModal from '@/components/ui/ConfirmModal';
import VaultPageHeading from '@/components/ui/VaultPageHeading';
import { appendAuditEntry } from '@/lib/auditLog';
import { buildDocumentPrefillFromOcr } from '@/lib/ocr/ocrExtract';
import {
  extractTextFromSharedFile,
  hasPendingShareFlag,
  takeNextSharedFile,
} from '@/lib/shareIntake';
import { documentMatchesStack, stackColorFromId } from '@/lib/documentStacks';
import { resolveMemberProfileById, isResolvableMemberId } from '@/lib/pastelDisplayMembers';
import { getBlockedCategory, isPro } from '@/lib/subscription';
import { getCategoryById } from '@/lib/categories';
import { resolveMemberColor } from '@/lib/memberAvatarColors';
import ProUpgradeModal from '@/components/ui/ProUpgradeModal';

export default function DocumentVaultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tv = useTranslations('documentVault');
  const stackId = searchParams.get('stack');

  const { vaultData, loading, persistVaultData } = useVaultData();
  const readOnly = vaultData.settings.emergencyModeEnabled;

  useEffect(() => {
    if (readOnly) {
      setShowAddModal(false);
      setEditDoc(null);
      setDeleteDoc(null);
    }
  }, [readOnly]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formPrefill, setFormPrefill] = useState<DocumentPrefill | null>(null);
  const [editDoc, setEditDoc] = useState<Document | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<Document | null>(null);
  const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; categoryLabel?: string }>({
    open: false,
  });
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

  const memberParam = searchParams.get('member');
  const addParam = searchParams.get('add');
  const activeMember = useMemo((): string | null => {
    if (!memberParam) return null;
    return isResolvableMemberId(memberParam, vaultData.members) ? memberParam : null;
  }, [memberParam, vaultData.members]);

  const sharedParam = searchParams.get('shared');

  /** Share sheet / PWA share target → OCR + open add form */
  useEffect(() => {
    if (loading || readOnly) return;
    if (sharedParam !== '1' && !hasPendingShareFlag()) return;

    let cancelled = false;
    void (async () => {
      const next = await takeNextSharedFile();
      if (cancelled) return;
      const p = new URLSearchParams(searchParams.toString());
      p.delete('shared');
      const qs = p.toString();
      router.replace(qs ? `/document-vault?${qs}` : '/document-vault');

      if (!next) {
        toast.message('No shared file waiting');
        return;
      }
      if (!vaultData.members[0]?.id) {
        toast.message('Add a family member first, then share again');
        return;
      }

      toast.message(`Importing “${next.meta.name}”…`);
      try {
        let text = '';
        try {
          text = await extractTextFromSharedFile(next.file);
        } catch {
          text = next.meta.text?.trim() || '';
        }
        if (cancelled) return;
        const fromOcr = text.trim() ? buildDocumentPrefillFromOcr(text) : null;
        setEditDoc(null);
        setFormPrefill({
          memberId: vaultData.members[0].id,
          categoryId: fromOcr?.categoryId,
          title: fromOcr?.title?.trim() || next.meta.title || next.meta.name.replace(/\.[^.]+$/, ''),
          fields: fromOcr?.fields ?? {},
          fromOcr: Boolean(text.trim()),
          notesAppend: [
            fromOcr?.notesAppend,
            `Shared into SecureVault from another app (${next.meta.name}). Review fields before saving.`,
          ]
            .filter(Boolean)
            .join('\n'),
        });
        setShowAddModal(true);
        toast.success('Shared file ready — review and save');
      } catch {
        toast.error('Could not read the shared file. Try Import file from Add document.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sharedParam, loading, readOnly, vaultData.members, searchParams, router]);

  /** Family card "Add Document" → open form with that member preselected */
  useEffect(() => {
    if (loading || readOnly) return;
    if (addParam !== '1' && addParam !== 'true') return;
    const memberId =
      activeMember ??
      (memberParam && isResolvableMemberId(memberParam, vaultData.members)
        ? memberParam
        : vaultData.members[0]?.id);
    if (!memberId) {
      toast.message('Add a family member first');
      return;
    }
    setEditDoc(null);
    setFormPrefill({
      memberId,
      title: '',
      fields: {},
    });
    setShowAddModal(true);
    const p = new URLSearchParams(searchParams.toString());
    p.delete('add');
    const qs = p.toString();
    router.replace(qs ? `/document-vault?${qs}` : '/document-vault');
  }, [
    addParam,
    activeMember,
    memberParam,
    loading,
    readOnly,
    vaultData.members,
    searchParams,
    router,
  ]);

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
    // Enforce free-plan limit: 1 document per category
    if (!editDoc && !isPro(vaultData.settings)) {
      const blocked = getBlockedCategory(
        vaultData.documents,
        docData.categoryId,
        vaultData.settings
      );
      if (blocked) {
        setShowAddModal(false);
        const cat = getCategoryById(blocked as Parameters<typeof getCategoryById>[0]);
        setUpgradeModal({ open: true, categoryLabel: cat?.label ?? blocked });
        return;
      }
    }

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
      appendAuditEntry({
        action: 'document_updated',
        actorMemberId: updatedDoc.memberId,
        targetId: updatedDoc.id,
        targetTitle: updatedDoc.title,
        categoryId: updatedDoc.categoryId,
      });
    } else {
      const newDoc: Document = {
        id: `doc-${crypto.randomUUID()}`,
        ...docData,
        createdAt: now,
        updatedAt: now,
      };
      updated = {
        ...vaultData,
        documents: [...vaultData.documents, newDoc],
      };
      toast.success(`"${newDoc.title}" added to vault`);
      appendAuditEntry({
        action: 'document_created',
        actorMemberId: newDoc.memberId,
        targetId: newDoc.id,
        targetTitle: newDoc.title,
        categoryId: newDoc.categoryId,
      });
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
    appendAuditEntry({
      action: 'document_deleted',
      actorMemberId: deleteDoc.memberId,
      targetId: deleteDoc.id,
      targetTitle: deleteDoc.title,
      categoryId: deleteDoc.categoryId,
    });
    setDeleteDoc(null);
  };

  const activeFiltersCount = [activeCategory, activeMember, search, stackId].filter(Boolean).length;

  const activeMemberProfile = useMemo(
    () => (activeMember ? resolveMemberProfileById(activeMember, vaultData.members) : null),
    [vaultData.members, activeMember]
  );

  const openAdd = () => {
    if (readOnly) {
      toast.message('Emergency mode is on — vault is read-only.');
      return;
    }
    const memberId = activeMember ?? vaultData.members[0]?.id;
    if (!memberId) {
      toast.message('Add a family member first');
      return;
    }
    setEditDoc(null);
    setFormPrefill({
      memberId,
      title: '',
      fields: {},
    });
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
      <div className="mx-auto max-w-screen-2xl space-y-6 p-4 lg:p-6">
        <div className="animate-pulse space-y-4">
          <div className="mx-auto h-8 w-48 rounded-[10px] bg-vault-elevated" />
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
      <>
        {readOnly && (
          <div
            className="mb-4 rounded-2xl border border-vault-coral/40 bg-vault-coral/10 px-4 py-3 text-sm text-vault-text"
            role="status"
          >
            {tv.rich('emergencyBanner', {
              strong: (chunks) => <strong className="font-800">{chunks}</strong>,
              link: (chunks) => (
                <Link href="/settings/emergency" className="font-700 text-vault-warm underline">
                  {chunks}
                </Link>
              ),
            })}
          </div>
        )}
        <DocumentVaultNotificationStrip
          documents={vaultData.documents}
          onGoToDocument={handleVaultNotificationGoToDoc}
          onInfoClick={scrollToDocumentList}
        />

        {activeStack ? (
          <div
            className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 shadow-[var(--vault-shadow)]"
            style={{
              borderColor: `${activeStackFolderColor}55`,
              background: `linear-gradient(135deg, ${activeStackFolderColor}14, rgba(18,18,18,0.85))`,
            }}
          >
            <div>
              <p className="text-[10px] font-medium text-vault-faint">
                {tv('folderFilterLabel')}
              </p>
              <p className="text-sm font-semibold text-vault-text">{activeStack.name}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => router.push('/document-vault')}
                className="rounded-xl bg-vault-warm px-3 py-1.5 text-xs font-bold text-vault-ink"
              >
                {tv('clearFolder')}
              </button>
            </div>
          </div>
        ) : null}

        <VaultPageHeading
          className="mb-5"
          eyebrow={tv('eyebrowDocuments')}
          title={tv('titleVault')}
          description={tv.rich('headingMeta', {
            docs: (chunks) => (
              <span className="font-semibold tabular-nums text-vault-text">{chunks}</span>
            ),
            members: (chunks) => (
              <span className="font-semibold tabular-nums text-vault-text">{chunks}</span>
            ),
            docCount: vaultData.documents.length,
            memberCount: vaultData.members.length,
          })}
          meta={
            activeStack || activeMemberProfile ? (
              <>
                {activeStack ? (
                  <p className="text-[12px] text-vault-faint">
                    {tv('folderMeta', {
                      filtered: stackFilteredDocuments.length,
                      total: vaultData.documents.length,
                    })}
                  </p>
                ) : null}
                {activeMemberProfile ? (
                  <p className="text-[12px] text-vault-faint">
                    {tv('memberFilterLead', { memberName: activeMemberProfile.name })}{' '}
                    <button
                      type="button"
                      onClick={() => setMemberFilter(null)}
                      className="font-semibold text-vault-warm underline-offset-2 hover:underline"
                    >
                      {tv('showAllMembers')}
                    </button>
                  </p>
                ) : null}
              </>
            ) : undefined
          }
          actions={
            !readOnly ? (
              <button
                type="button"
                onClick={openAdd}
                className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-[#4338C9] px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(67,56,201,0.28)] transition-all hover:bg-[#372fb0] active:scale-[0.98]"
              >
                <Plus size={18} strokeWidth={2.5} aria-hidden />
                {tv('addDocument')}
              </button>
            ) : null
          }
        />

        {/* Free plan limit banner — dark purple Pro accent */}
        {!isPro(vaultData.settings) && (
          <div
            className="mb-5 flex items-center justify-between gap-3 overflow-hidden rounded-2xl px-4 py-3 text-white shadow-[0_8px_24px_rgba(67,56,201,0.25)]"
            style={{
              background: 'linear-gradient(135deg, #4338C9 0%, #6d28d9 50%, #7c3aed 100%)',
            }}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/25 backdrop-blur-sm">
                <Crown className="h-4 w-4 text-yellow-300" strokeWidth={2.4} />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-white">{tv('freePlanTitle')}</p>
                <p className="text-[11px] text-white/80">{tv('freePlanBody')}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setUpgradeModal({ open: true })}
              className="shrink-0 rounded-full bg-yellow-300 px-3.5 py-1.5 text-[11px] font-extrabold text-[#4338C9] shadow-[0_4px_12px_rgba(0,0,0,0.18)] transition-all active:scale-95"
            >
              {tv('upgrade')}
            </button>
          </div>
        )}

        <VaultDashboardStats vaultData={vaultData} />

        <div className="rounded-[20px] p-4 sm:p-5 mb-4 bg-vault-panel border border-[color:var(--color-border)] shadow-vault relative z-0">
          <div className="relative z-[1] flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1">
                <input
                  id="vault-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={tv('searchPlaceholder')}
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
                    aria-label={tv('clearSearchAria')}
                  >
                    <X size={14} />
                  </button>
                ) : null}
              </div>
              {!readOnly ? (
                <button
                  type="button"
                  onClick={openAdd}
                  className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-[#4338C9] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(67,56,201,0.28)] transition-all hover:bg-[#372fb0] active:scale-[0.98] sm:w-auto"
                >
                  <Plus size={18} strokeWidth={2.5} aria-hidden />
                  {tv('addDocument')}
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
                  {tv('filterAll')}
                </button>
                {vaultData.members.length === 0 ? (
                  <p className="self-center text-xs text-vault-muted">
                    {tv('noMembersFilterLead')}{' '}
                    <Link
                      href="/family-management"
                      className="font-700 text-vault-warm hover:underline"
                    >
                      {tv('addMembersLink')}
                    </Link>{' '}
                    {tv('noMembersFilterTrail')}
                  </p>
                ) : null}
                {vaultData.members.map((m) => {
                  const isMemberActive = activeMember === m.id;
                  const mc = resolveMemberColor(m.avatarColor);
                  return (
                    <button
                      key={`filter-member-${m.id}`}
                      type="button"
                      onClick={() => setMemberFilter(isMemberActive ? null : m.id)}
                      className={`inline-flex max-w-[200px] items-center gap-2 px-4 py-1.5 rounded-[20px] text-[13px] font-semibold transition-all duration-150 border ${
                        isMemberActive
                          ? 'shadow-vault ring-1'
                          : 'bg-vault-elevated text-vault-muted border border-border hover:bg-vault-panel'
                      }`}
                      style={
                        isMemberActive
                          ? {
                              backgroundColor: mc.bg,
                              borderColor: mc.border,
                              color: mc.text,
                            }
                          : undefined
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
                  {tv('clearFilters')}
                </button>
              )}
            </div>

            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-xs text-vault-muted">
                  {tv('showingCount', {
                    filtered: filteredDocuments.length,
                    total: stackFilteredDocuments.length,
                  })}
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
          readOnly={readOnly}
          onQuickAddCategory={(categoryId) => {
            const memberId = activeMember ?? vaultData.members[0]?.id;
            if (!memberId) {
              toast.message('Add a family member first');
              return;
            }
            setFormPrefill({
              categoryId: categoryId as CategoryId,
              memberId,
              title: '',
              fields: {},
            });
            setEditDoc(null);
            setShowAddModal(true);
          }}
          onAddDocument={openAdd}
        />

        <div className="mt-8 border-t border-[color:var(--color-border)] pt-6">
          <p className="mb-3 text-sm font-700 text-vault-muted">Filter by category</p>
          <CategoryCards
            documents={stackFilteredDocuments}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />
        </div>
      </>

      <DocumentFormModal
        isOpen={showAddModal && !readOnly}
        onClose={() => {
          setShowAddModal(false);
          setEditDoc(null);
          setFormPrefill(null);
        }}
        onSave={handleSaveDocument}
        editDoc={editDoc}
        members={vaultData.members}
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

      <ProUpgradeModal
        isOpen={upgradeModal.open}
        onClose={() => setUpgradeModal({ open: false })}
        blockedCategory={upgradeModal.categoryLabel}
      />
    </div>
  );
}
