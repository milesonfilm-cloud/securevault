'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Camera } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Modal from '@/components/ui/Modal';
import ScanDocumentModal from '@/components/scan/ScanDocumentModal';
import { CATEGORIES, getCategoryById } from '@/lib/categories';
import { categoryFieldMsgKey } from '@/lib/categoryI18n';
import { Document, DocumentStack, FamilyMember } from '@/lib/storage';
import { CategoryId } from '@/lib/storage';
import type { DocumentPrefill } from '@/lib/ocr/documentPrefill';

interface DocumentFormData {
  memberId: string;
  categoryId: CategoryId;
  title: string;
  notes: string;
  tags: string;
  [key: string]: string;
}

interface DocumentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editDoc?: Document | null;
  members: FamilyMember[];
  /** Stack board folders (sorted). */
  folders: DocumentStack[];
  /** Pre-select folder when adding (e.g. vault opened with `?stack=`). */
  defaultStackId?: string | null;
  /** Default document owner when adding (session profile). */
  defaultMemberId?: string | null;
  prefill?: DocumentPrefill | null;
}

export default function DocumentFormModal({
  isOpen,
  onClose,
  onSave,
  editDoc,
  members,
  folders,
  defaultStackId = null,
  defaultMemberId = null,
  prefill = null,
}: DocumentFormModalProps) {
  const td = useTranslations('documents');
  const tc = useTranslations('categories');
  const tcom = useTranslations('common');
  const [showPassword, setShowPassword] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  /** Merged into form after an in-modal AI scan (badges + banner). */
  const [aiAugment, setAiAugment] = useState<DocumentPrefill | null>(null);
  const [selectedStackId, setSelectedStackId] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<DocumentFormData>({
    defaultValues: {
      memberId: members[0]?.id || '',
      categoryId: 'government-ids',
      title: '',
      notes: '',
      tags: '',
    },
  });

  const selectedCategoryId = watch('categoryId') as CategoryId;
  const categoryConfig = getCategoryById(selectedCategoryId);
  const isPasswordCategory = selectedCategoryId === 'password-vault';

  const categoryTitle = categoryConfig
    ? tc(`${categoryConfig.id}.label` as Parameters<typeof tc>[0])
    : '';

  const passwordFieldKey = useMemo(() => {
    if (!categoryConfig) return null;
    return categoryConfig.fields.find((f) => f.key === 'Password')?.key || null;
  }, [categoryConfig]);

  const aiMeta = useMemo(() => {
    const keys = new Set<string>([
      ...(prefill?.aiFilledFieldKeys ?? []),
      ...(aiAugment?.aiFilledFieldKeys ?? []),
    ]);
    return {
      fromAiScan: !!(prefill?.fromAiScan || aiAugment?.fromAiScan),
      fromOcrOnly: !!(prefill?.fromOcr && !prefill?.fromAiScan && !aiAugment?.fromAiScan),
      aiFilledFieldKeys: [...keys],
      aiConfidence: { ...prefill?.aiConfidence, ...aiAugment?.aiConfidence },
    };
  }, [prefill, aiAugment]);

  useEffect(() => {
    if (!isOpen) {
      setAiAugment(null);
      setScanOpen(false);
      return;
    }
    if (editDoc) {
      reset({
        memberId: editDoc.memberId,
        categoryId: editDoc.categoryId,
        title: editDoc.title,
        notes: editDoc.notes,
        tags: editDoc.tags.join(', '),
        ...editDoc.fields,
      });
      setSelectedStackId(editDoc.stackId ?? null);
    } else {
      const preferredMemberId =
        defaultMemberId && members.some((m) => m.id === defaultMemberId)
          ? defaultMemberId
          : members[0]?.id || '';
      if (prefill) {
        reset({
          memberId: preferredMemberId,
          categoryId: prefill.categoryId ?? 'government-ids',
          title: prefill.title ?? '',
          notes: (prefill.notesAppend ?? '').trim(),
          tags: '',
          ...(prefill.fields ?? {}),
        });
        const valid = new Set(folders.map((f) => f.id));
        setSelectedStackId(
          defaultStackId && valid.has(defaultStackId) ? defaultStackId : null
        );
      } else {
        reset({
          memberId: preferredMemberId,
          categoryId: 'government-ids',
          title: '',
          notes: '',
          tags: '',
        });
        const valid = new Set(folders.map((f) => f.id));
        setSelectedStackId(
          defaultStackId && valid.has(defaultStackId) ? defaultStackId : null
        );
      }
    }
  }, [editDoc, isOpen, members, prefill, reset, folders, defaultStackId, defaultMemberId]);

  const onSubmit = (data: DocumentFormData) => {
    const { memberId, categoryId, title, notes, tags, ...rest } = data;
    const fields: Record<string, string> = {};
    if (categoryConfig) {
      categoryConfig.fields.forEach((f) => {
        if (rest[f.key] !== undefined && rest[f.key] !== '') {
          fields[f.key] = rest[f.key];
        }
      });
    }
    onSave({
      memberId,
      categoryId,
      title,
      fields,
      notes,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      stackId: selectedStackId,
    });
  };

  return (
    <>
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editDoc ? td('editDocument') : td('modalAddTitle')}
      subtitle={td('saveLocalSubtitle')}
      size="lg"
      headerActions={
        !editDoc ? (
          <button
            type="button"
            onClick={() => setScanOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-vault-elevated px-3 py-2 text-xs font-bold text-vault-text transition-colors hover:bg-vault-panel"
            title={td('scanTitle')}
          >
            <Camera size={16} className="text-vault-warm" />
            {td('scanDocument')}
          </button>
        ) : undefined
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
        {!editDoc && aiMeta.fromOcrOnly ? (
          <div className="rounded-xl border border-[rgba(20,115,230,0.35)] bg-[rgba(20,115,230,0.08)] px-4 py-3 text-sm text-vault-text">
            <p className="font-semibold text-vault-warm">{td('reviewOcrTitle')}</p>
            <p className="text-vault-muted text-xs mt-1">{td('reviewOcrBody')}</p>
          </div>
        ) : null}

        {!editDoc && aiMeta.fromAiScan ? (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-vault-text">
            <p className="font-semibold text-amber-200">{td('aiVerifyTitle')}</p>
            <p className="text-vault-muted text-xs mt-1">{td('aiVerifyBody')}</p>
          </div>
        ) : null}

        {/* Basic info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text">{td('familyMemberLabel')}</label>
            <select
              {...register('memberId', { required: td('selectFamilyMember') })}
              className="input-field"
            >
              {members.map((m) => (
                <option key={`form-member-${m.id}`} value={m.id}>
                  {m.name} ({m.relationship})
                </option>
              ))}
            </select>
            {errors.memberId && (
              <p className="text-xs text-red-500 mt-1">{errors.memberId.message}</p>
            )}
          </div>

          <div>
            <label className="label-text">{td('categoryLabel')}</label>
            <select
              {...register('categoryId', { required: td('selectCategory') })}
              className="input-field"
            >
              {CATEGORIES.map((cat) => (
                <option key={`form-cat-${cat.id}`} value={cat.id}>
                  {tc(`${cat.id}.label` as Parameters<typeof tc>[0])}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Optional folder — at most one */}
        <div className="rounded-xl border border-[color:var(--color-border)] bg-vault-elevated/40 px-4 py-3">
          <label className="label-text mb-1">{td('folderLabel')}</label>
          <p className="text-xs text-vault-faint mb-3">{td('folderHint')}</p>
          {folders.length === 0 ? (
            <p className="text-sm text-vault-muted">{td('noFolders')}</p>
          ) : (
            <select
              className="input-field"
              value={selectedStackId ?? ''}
              onChange={(e) => setSelectedStackId(e.target.value || null)}
            >
              <option value="">{td('noFolderOption')}</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="label-text">{td('titleLabel')}</label>
          <p className="text-xs text-vault-faint mb-1.5">{td('titleHint')}</p>
          <input
            {...register('title', { required: td('titleRequired') })}
            placeholder={td('titlePlaceholder')}
            className="input-field"
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
        </div>

        {/* Dynamic category fields */}
        {categoryConfig && categoryConfig.fields.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="h-px flex-1"
                style={{ backgroundColor: `${categoryConfig.color}30` }}
              />
              <span
                className="text-xs font-700 uppercase tracking-widest px-2"
                style={{ color: categoryConfig.color }}
              >
                {td('fieldsHeading', { category: categoryTitle })}
              </span>
              <div
                className="h-px flex-1"
                style={{ backgroundColor: `${categoryConfig.color}30` }}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categoryConfig.fields.map((field) => {
                const fieldLabel = tc(
                  `${selectedCategoryId}.fields.${categoryFieldMsgKey(field.key)}` as Parameters<
                    typeof tc
                  >[0]
                );
                return (
                <div key={`form-field-${field.key}`}>
                  <label className="label-text inline-flex flex-wrap items-center gap-x-1.5 gap-y-1">
                    <span>
                      {fieldLabel}
                      {field.required && <span className="text-red-400 ml-0.5">*</span>}
                      {field.sensitive && (
                        <span className="ml-1.5 text-xs text-vault-coral font-400">{td('sensitiveTag')}</span>
                      )}
                    </span>
                    {!editDoc && aiMeta.aiFilledFieldKeys.includes(field.key) ? (
                      <span
                        title={
                          aiMeta.aiConfidence[field.key] != null
                            ? `AI confidence ~${Math.round((aiMeta.aiConfidence[field.key] ?? 0) * 100)}%`
                            : 'Filled by AI scan'
                        }
                        className="rounded-md bg-amber-400 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-amber-950"
                      >
                        {td('aiFilledBadge')}
                      </span>
                    ) : null}
                  </label>
                  {field.type === 'select' && field.options ? (
                    <select
                      {...register(field.key, {
                        required: field.required ? tcom('fieldRequired', { field: fieldLabel }) : false,
                      })}
                      className="input-field"
                    >
                      <option value="">{td('selectPlaceholder')}</option>
                      {field.options.map((opt) => (
                        <option key={`opt-${field.key}-${opt}`} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="relative">
                      <input
                        {...register(field.key, {
                          required: field.required ? tcom('fieldRequired', { field: fieldLabel }) : false,
                        })}
                        type={
                          isPasswordCategory && field.key === passwordFieldKey
                            ? showPassword
                              ? 'text'
                              : 'password'
                            : field.type
                        }
                        placeholder={
                          field.placeholder ||
                          td('fieldPlaceholder', { field: fieldLabel })
                        }
                        className={
                          isPasswordCategory && field.key === passwordFieldKey
                            ? 'input-field pr-11'
                            : 'input-field'
                        }
                      />
                      {isPasswordCategory && field.key === passwordFieldKey && (
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-vault-faint hover:text-vault-warm transition-colors"
                          title={showPassword ? td('hidePassword') : td('showPassword')}
                        >
                          {showPassword ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M3 3l18 18"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                              <path
                                d="M10.58 10.58a2 2 0 002.83 2.83"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                              <path
                                d="M9.88 5.09A10.6 10.6 0 0112 5c7 0 10 7 10 7a18.8 18.8 0 01-3.07 4.13"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                              <path
                                d="M6.6 6.6A18.8 18.8 0 002 12s3 7 10 7a10.7 10.7 0 004.12-.8"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                  {errors[field.key] && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors[field.key]?.message as string}
                    </p>
                  )}
                </div>
              );
              })}
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="label-text">{td('notesLabel')}</label>
          <p className="text-xs text-vault-faint mb-1.5">{td('notesHint')}</p>
          <textarea
            {...register('notes')}
            rows={2}
            placeholder={td('notesPlaceholder')}
            className="input-field resize-none"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="label-text">{td('tagsLabel')}</label>
          <p className="text-xs text-vault-faint mb-1.5">{td('tagsHint')}</p>
          <input {...register('tags')} placeholder={td('tagsPlaceholder')} className="input-field" />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-border">
          <button type="button" onClick={onClose} className="btn-secondary">
            {tcom('cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary min-w-[120px] justify-center"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                {td('saving')}
              </span>
            ) : editDoc ? (
              td('saveChanges')
            ) : (
              td('addDocumentCta')
            )}
          </button>
        </div>
      </form>
    </Modal>

    <ScanDocumentModal
      isOpen={scanOpen}
      onClose={() => setScanOpen(false)}
      onApply={({ prefill: p }) => {
        const cur = getValues();
        const nextNotes = [cur.notes?.trim(), p.notesAppend?.trim()].filter(Boolean).join('\n');
        reset({
          ...cur,
          categoryId: (p.categoryId ?? cur.categoryId) as CategoryId,
          title: p.title?.trim() ? p.title : cur.title,
          notes: nextNotes,
          tags: cur.tags,
          ...(p.fields ?? {}),
        });
        setAiAugment({
          fromAiScan: true,
          aiFilledFieldKeys: p.aiFilledFieldKeys,
          aiConfidence: p.aiConfidence,
        });
        setScanOpen(false);
      }}
    />
    </>
  );
}
