'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FileUp, Loader2, PenLine } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import Modal from '@/components/ui/Modal';
import CopyValueButton from '@/components/ui/CopyValueButton';
import { CATEGORIES, getCategoryById, type FieldFormat } from '@/lib/categories';
import { categoryFieldMsgKey } from '@/lib/categoryI18n';
import { Document, FamilyMember } from '@/lib/storage';
import { CategoryId } from '@/lib/storage';
import type { DocumentPrefill } from '@/lib/ocr/documentPrefill';
import { extractTextFromImportFile, IMPORT_FILE_ACCEPT } from '@/lib/import/fileImportExtract';
import { buildDocumentPrefillFromOcr } from '@/lib/ocr/ocrExtract';
import {
  collectCategoryFieldErrors,
  validateCategoryFieldValue,
} from '@/lib/fieldValidation';
import { cn } from '@/lib/utils';

function RequiredAsterisk() {
  return (
    <span className="ml-0.5 font-700 text-red-600" aria-hidden>
      *
    </span>
  );
}

// ─── Input formatters ────────────────────────────────────────────────────────

function applyFormat(raw: string, format: FieldFormat): string {
  const digits = raw.replace(/\D/g, '');
  switch (format) {
    case 'date-dmy': {
      // Allow only digits, auto-insert hyphens: DD-MM-YYYY
      const d = digits.slice(0, 8);
      if (d.length <= 2) return d;
      if (d.length <= 4) return `${d.slice(0, 2)}-${d.slice(2)}`;
      return `${d.slice(0, 2)}-${d.slice(2, 4)}-${d.slice(4)}`;
    }
    case 'card-number': {
      // xxxx-xxxx-xxxx-xxxx
      const c = digits.slice(0, 16);
      const parts: string[] = [];
      for (let i = 0; i < c.length; i += 4) parts.push(c.slice(i, i + 4));
      return parts.join('-');
    }
    case 'expiry-mmyyyy': {
      // MM/YYYY
      const e = digits.slice(0, 6);
      if (e.length <= 2) return e;
      return `${e.slice(0, 2)}/${e.slice(2)}`;
    }
    case 'cvv':
      return digits.slice(0, 4);
    case 'account-number': {
      // group in 4s with spaces
      const a = digits.slice(0, 20);
      const parts: string[] = [];
      for (let i = 0; i < a.length; i += 4) parts.push(a.slice(i, i + 4));
      return parts.join(' ');
    }
    case 'aadhaar': {
      const a = digits.slice(0, 12);
      const parts: string[] = [];
      for (let i = 0; i < a.length; i += 4) parts.push(a.slice(i, i + 4));
      return parts.join(' ');
    }
    case 'phone': {
      // keep + prefix, strip non-digits after
      const ph = raw.replace(/[^\d+\s\-()]/g, '');
      return ph.slice(0, 18);
    }
    case 'ifsc':
      return raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11);
    case 'pan':
      return raw.toUpperCase().slice(0, 10);
    case 'alpha-upper':
      return raw.toUpperCase().slice(0, 16);
    default:
      return raw;
  }
}

function getInputMode(
  format: FieldFormat | undefined
): React.HTMLAttributes<HTMLInputElement>['inputMode'] {
  if (!format) return undefined;
  if (
    ['date-dmy', 'card-number', 'expiry-mmyyyy', 'cvv', 'account-number', 'aadhaar'].includes(format)
  )
    return 'numeric';
  if (format === 'phone') return 'tel';
  if (format === 'email' || format === 'login-id') return 'email';
  if (format === 'url') return 'url';
  return undefined;
}

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
  prefill?: DocumentPrefill | null;
}

export default function DocumentFormModal({
  isOpen,
  onClose,
  onSave,
  editDoc,
  members,
  prefill = null,
}: DocumentFormModalProps) {
  const td = useTranslations('documents');
  const tc = useTranslations('categories');
  const tcom = useTranslations('common');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [addFlowStep, setAddFlowStep] = useState<'choose' | 'form'>('choose');
  const [importBusy, setImportBusy] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    getValues,
    setError,
    trigger,
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
  const watchedDocumentType = watch('Document Type');
  const categoryConfig = getCategoryById(selectedCategoryId);

  const categoryTitle = categoryConfig
    ? tc(`${categoryConfig.id}.label` as Parameters<typeof tc>[0])
    : '';

  const fromOcrOnly = !!(prefill?.fromOcr);

  useEffect(() => {
    if (!isOpen) {
      setAddFlowStep('choose');
      setImportBusy(false);
      setShowSecrets({});
      return;
    }
    if (editDoc || prefill) {
      setAddFlowStep('form');
    } else {
      setAddFlowStep('choose');
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
    } else {
      const preferredMemberId = members[0]?.id || '';
      if (prefill) {
        reset({
          memberId: preferredMemberId,
          categoryId: prefill.categoryId ?? 'government-ids',
          title: prefill.title ?? '',
          notes: (prefill.notesAppend ?? '').trim(),
          tags: '',
          ...(prefill.fields ?? {}),
        });
      } else {
        reset({
          memberId: preferredMemberId,
          categoryId: 'government-ids',
          title: '',
          notes: '',
          tags: '',
        });
      }
    }
  }, [editDoc, isOpen, members, prefill, reset]);

  useEffect(() => {
    if (!categoryConfig?.fields.some((f) => f.key === 'ID / Document Number')) return;
    void trigger('ID / Document Number');
  }, [watchedDocumentType, categoryConfig, trigger]);

  const onSubmit = (data: DocumentFormData) => {
    if (categoryConfig) {
      const fieldErrors = collectCategoryFieldErrors(
        categoryConfig.fields,
        data,
        (field) =>
          tcom('fieldRequired', {
            field: tc(
              `${selectedCategoryId}.fields.${categoryFieldMsgKey(field.key)}` as Parameters<
                typeof tc
              >[0]
            ),
          })
      );
      if (Object.keys(fieldErrors).length > 0) {
        for (const [key, message] of Object.entries(fieldErrors)) {
          setError(key, { type: 'validate', message });
        }
        return;
      }
    }
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
      stackId: editDoc?.stackId ?? null,
    });
  };

  const handleImportFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      setImportBusy(true);
      try {
        let text: string;
        try {
          text = await extractTextFromImportFile(file);
        } catch (err) {
          const msg = err instanceof Error ? err.message : '';
          if (msg === 'legacy_doc') {
            toast.error(td('importLegacyDocError'));
          } else if (msg === 'unsupported_type') {
            toast.error(td('importUnsupportedError'));
          } else {
            toast.error(td('importFailed'));
          }
          return;
        }
        if (!text.trim()) {
          toast.error(td('importNoText'));
          return;
        }
        const prefillFromFile = buildDocumentPrefillFromOcr(text);
        const preferredMemberId = members[0]?.id || '';
        const baseName = file.name.replace(/\.[^.]+$/, '') || td('importDefaultTitle');
        reset({
          memberId: preferredMemberId,
          categoryId: prefillFromFile.categoryId ?? 'government-ids',
          title: prefillFromFile.title?.trim() ? prefillFromFile.title : baseName,
          notes: [prefillFromFile.notesAppend?.trim()].filter(Boolean).join('\n'),
          tags: '',
          ...(prefillFromFile.fields ?? {}),
        });
        setAddFlowStep('form');
        toast.success(td('importSuccess'));
      } catch {
        toast.error(td('importFailed'));
      } finally {
        setImportBusy(false);
      }
    },
    [members, reset, td]
  );

  const showMethodChooser = !editDoc && !prefill && addFlowStep === 'choose';

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={editDoc ? td('editDocument') : td('modalAddTitle')}
        subtitle={showMethodChooser ? td('chooseAddMethodSubtitle') : td('saveLocalSubtitle')}
        size="lg"
      >
        {showMethodChooser ? (
          <div className="space-y-4 p-6">
            <p className="text-center text-sm text-vault-muted">{td('chooseAddMethodHint')}</p>
            <div className="grid gap-3">
              <button
                type="button"
                disabled={importBusy}
                onClick={() => importInputRef.current?.click()}
                className="flex w-full items-start gap-3 rounded-2xl border border-[color:var(--color-border)] bg-vault-elevated px-4 py-4 text-left transition-colors hover:bg-vault-panel disabled:opacity-60"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-vault-warm/15 text-vault-warm">
                  {importBusy ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <FileUp className="h-5 w-5" strokeWidth={2} />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-800 text-vault-text">
                    {td('methodImportFile')}
                  </span>
                  <span className="mt-0.5 block text-xs text-vault-muted">
                    {td('methodImportFileDesc')}
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setAddFlowStep('form')}
                className="flex w-full items-start gap-3 rounded-2xl border border-[color:var(--color-border)] bg-vault-elevated px-4 py-4 text-left transition-colors hover:bg-vault-panel"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-vault-warm/15 text-vault-warm">
                  <PenLine className="h-5 w-5" strokeWidth={2} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-800 text-vault-text">
                    {td('methodManual')}
                  </span>
                  <span className="mt-0.5 block text-xs text-vault-muted">
                    {td('methodManualDesc')}
                  </span>
                </span>
              </button>
            </div>
            <input
              ref={importInputRef}
              type="file"
              accept={IMPORT_FILE_ACCEPT}
              className="hidden"
              onChange={handleImportFile}
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6">
            {!editDoc && !prefill ? (
              <div className="-mt-1 mb-1">
                <button
                  type="button"
                  onClick={() => setAddFlowStep('choose')}
                  className="text-xs font-600 text-vault-warm hover:underline"
                >
                  ← {td('backToAddMethods')}
                </button>
              </div>
            ) : null}
            {!editDoc && fromOcrOnly ? (
              <div className="rounded-xl border border-[rgba(20,115,230,0.35)] bg-[rgba(20,115,230,0.08)] px-4 py-3 text-sm text-vault-text">
                <p className="font-semibold text-vault-warm">{td('reviewOcrTitle')}</p>
                <p className="text-vault-muted text-xs mt-1">{td('reviewOcrBody')}</p>
              </div>
            ) : null}

            {/* Basic info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-text">
                  {td('familyMemberLabel')}
                  <RequiredAsterisk />
                </label>
                <select
                  {...register('memberId', { required: td('selectFamilyMember') })}
                  className={cn('input-field mt-1', errors.memberId && 'border-red-500 ring-1 ring-red-400/40')}
                >
                  {members.map((m) => (
                    <option key={`form-member-${m.id}`} value={m.id}>
                      {m.name} ({m.relationship})
                    </option>
                  ))}
                </select>
                {errors.memberId && (
                  <p className="mt-1 text-xs font-600 text-red-600" role="alert">
                    {errors.memberId.message}
                  </p>
                )}
              </div>

              <div>
                <label className="label-text">
                  {td('categoryLabel')}
                  <RequiredAsterisk />
                </label>
                <select
                  {...register('categoryId', { required: td('selectCategory') })}
                  className={cn('input-field mt-1', errors.categoryId && 'border-red-500 ring-1 ring-red-400/40')}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={`form-cat-${cat.id}`} value={cat.id}>
                      {tc(`${cat.id}.label` as Parameters<typeof tc>[0])}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <label className="label-text">
                    {td('titleLabel')}
                    <RequiredAsterisk />
                  </label>
                  <p className="text-xs text-vault-faint mb-1.5">{td('titleHint')}</p>
                </div>
                <CopyValueButton value={watch('title') ?? ''} compact className="mt-0.5" />
              </div>
              <input
                {...register('title', {
                  required: td('titleRequired'),
                  minLength: { value: 2, message: td('titleTooShort') },
                })}
                placeholder={td('titlePlaceholder')}
                className={cn('input-field', errors.title && 'border-red-500 ring-1 ring-red-400/40')}
              />
              {errors.title && (
                <p className="mt-1 text-xs font-600 text-red-600" role="alert">
                  {errors.title.message}
                </p>
              )}
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
                    const isSecretTypedField = field.key === 'Password' || field.key === 'CVV';
                    const secretRevealed = !!showSecrets[field.key];
                    const requiredMessage = tcom('fieldRequired', { field: fieldLabel });
                    const fieldHasError = Boolean(errors[field.key]);
                    return (
                      <div key={`form-field-${field.key}`}>
                        <div className="flex items-start justify-between gap-2">
                          <label className="label-text !mb-0 inline-flex flex-1 flex-wrap items-center gap-x-1.5 gap-y-1">
                            <span>
                              {fieldLabel}
                              {field.required && <RequiredAsterisk />}
                              {field.sensitive && (
                                <span className="ml-1.5 text-xs text-vault-coral font-400">
                                  {td('sensitiveTag')}
                                </span>
                              )}
                            </span>
                          </label>
                          {field.type !== 'select' && (
                            <CopyValueButton
                              value={watch(field.key) ?? ''}
                              compact
                              className="mt-0.5"
                            />
                          )}
                        </div>
                        {field.type === 'select' && field.options ? (
                          <select
                            {...register(field.key, {
                              required: field.required ? requiredMessage : false,
                              validate: (value) =>
                                validateCategoryFieldValue(
                                  field,
                                  value ?? '',
                                  getValues(),
                                  requiredMessage
                                ),
                            })}
                            className={cn(
                              'input-field mt-1',
                              fieldHasError && 'border-red-500 ring-1 ring-red-400/40'
                            )}
                          >
                            <option value="">{td('selectPlaceholder')}</option>
                            {field.options.map((opt) => (
                              <option key={`opt-${field.key}-${opt}`} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="relative mt-1">
                            <input
                              {...register(field.key, {
                                required: field.required ? requiredMessage : false,
                                validate: (value) =>
                                  validateCategoryFieldValue(
                                    field,
                                    value ?? '',
                                    getValues(),
                                    requiredMessage
                                  ),
                                onChange: field.format
                                  ? (e: React.ChangeEvent<HTMLInputElement>) => {
                                      e.target.value = applyFormat(e.target.value, field.format!);
                                    }
                                  : undefined,
                              })}
                              type={
                                isSecretTypedField
                                  ? secretRevealed
                                    ? 'text'
                                    : 'password'
                                  : 'text'
                              }
                              inputMode={getInputMode(field.format)}
                              placeholder={
                                field.placeholder || td('fieldPlaceholder', { field: fieldLabel })
                              }
                              autoComplete={isSecretTypedField ? 'off' : undefined}
                              className={cn(
                                isSecretTypedField ? 'input-field pr-11' : 'input-field',
                                fieldHasError && 'border-red-500 ring-1 ring-red-400/40'
                              )}
                            />
                            {isSecretTypedField && (
                              <button
                                type="button"
                                onClick={() =>
                                  setShowSecrets((s) => ({
                                    ...s,
                                    [field.key]: !s[field.key],
                                  }))
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-vault-faint hover:text-vault-warm transition-colors"
                                title={secretRevealed ? td('hidePassword') : td('showPassword')}
                              >
                                {secretRevealed ? (
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
                                    <circle
                                      cx="12"
                                      cy="12"
                                      r="3"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    />
                                  </svg>
                                )}
                              </button>
                            )}
                          </div>
                        )}
                        {errors[field.key] && (
                          <p className="mt-1 text-xs font-600 text-red-600" role="alert">
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
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <label className="label-text">{td('notesLabel')}</label>
                  <p className="text-xs text-vault-faint mb-1.5">{td('notesHint')}</p>
                </div>
                <CopyValueButton value={watch('notes') ?? ''} compact className="mt-0.5" />
              </div>
              <textarea
                {...register('notes')}
                rows={2}
                placeholder={td('notesPlaceholder')}
                className="input-field resize-none"
              />
            </div>

            {/* Tags */}
            <div>
              <div className="min-w-0 flex-1">
                <label className="label-text">{td('tagsLabel')}</label>
                <p className="text-xs text-vault-faint mb-1.5">{td('tagsHint')}</p>
              </div>
              <input
                {...register('tags')}
                placeholder={td('tagsPlaceholder')}
                className="input-field"
              />
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
        )}
      </Modal>
    </>
  );
}
