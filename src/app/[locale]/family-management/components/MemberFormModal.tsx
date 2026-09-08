'use client';

import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Camera, X } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import CopyValueButton from '@/components/ui/CopyValueButton';
import { FamilyMember } from '@/lib/storage';
import { MEMBER_COLORS, pickNextMemberColor } from '@/lib/memberAvatarColors';
import { resizeImageFileToJpegDataUrl } from '@/lib/memberPhoto';
import MemberAvatar from '@/components/MemberAvatar';
import { MEMBER_RELATIONSHIP_VALUES } from '@/lib/memberRelationships';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

function RequiredAsterisk() {
  return (
    <span className="ml-0.5 font-700 text-red-600" aria-hidden>
      *
    </span>
  );
}

interface MemberFormData {
  name: string;
  relationship: string;
  dob: string;
  avatarColor: string;
  /** Empty string when no photo (RHF + hidden input). */
  photoDataUrl: string;
}

export type MemberFormSavePayload = Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>;

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MemberFormSavePayload) => void;
  editMember?: FamilyMember | null;
  members?: { avatarColor: string }[];
}

export default function MemberFormModal({
  isOpen,
  onClose,
  onSave,
  editMember,
  members = [],
}: MemberFormModalProps) {
  const t = useTranslations('memberForm');
  const tc = useTranslations('common');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MemberFormData>({
    defaultValues: {
      name: '',
      relationship: MEMBER_RELATIONSHIP_VALUES[0],
      dob: '',
      avatarColor: pickNextMemberColor(members),
      photoDataUrl: '',
    },
  });

  const selectedColor = watch('avatarColor');
  const watchedName = watch('name');
  const photoDataUrl = watch('photoDataUrl');
  const usedColorsKey = members.map((m) => m.avatarColor.toLowerCase()).join('|');

  useEffect(() => {
    if (editMember) {
      reset({
        name: editMember.name,
        relationship: editMember.relationship,
        dob: editMember.dob,
        avatarColor: editMember.avatarColor,
        photoDataUrl: editMember.photoDataUrl ?? '',
      });
    } else {
      reset({
        name: '',
        relationship: MEMBER_RELATIONSHIP_VALUES[0],
        dob: '',
        avatarColor: pickNextMemberColor(members),
        photoDataUrl: '',
      });
    }
  }, [editMember, isOpen, usedColorsKey, reset]);

  const onSubmit = (data: MemberFormData) => {
    onSave({
      name: data.name,
      relationship: data.relationship,
      dob: data.dob,
      avatarColor: data.avatarColor,
      photoDataUrl: data.photoDataUrl.trim() ? data.photoDataUrl : null,
    });
  };

  const handlePickPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const url = await resizeImageFileToJpegDataUrl(file);
      setValue('photoDataUrl', url, { shouldDirty: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('photoError'));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editMember ? t('editTitle') : t('addTitle')}
      subtitle={t('subtitle')}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6">
        {/* Avatar preview */}
        <div className="flex flex-col items-center gap-3">
          <MemberAvatar
            name={watchedName || '?'}
            avatarColor={selectedColor}
            photoDataUrl={photoDataUrl || null}
            className="h-20 w-20 rounded-2xl text-xl"
            textClassName="text-xl"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handlePickPhoto}
          />
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary inline-flex items-center gap-2 py-2 text-xs"
            >
              <Camera size={16} />
              {photoDataUrl ? t('changePhoto') : t('addPhotoBtn')}
            </button>
            {photoDataUrl ? (
              <button
                type="button"
                onClick={() => setValue('photoDataUrl', '', { shouldDirty: true })}
                className="inline-flex items-center gap-1 rounded-xl border border-[color:var(--color-border)] px-3 py-2 text-xs font-600 text-vault-muted transition-colors hover:bg-vault-elevated hover:text-vault-text"
              >
                <X size={14} />
                {t('removePhoto')}
              </button>
            ) : null}
          </div>
          <p className="max-w-xs text-center text-[11px] text-vault-faint">
            {t('photoHint')}
          </p>
        </div>

        {/* Name */}
        <div>
          <div className="mb-1 flex items-start justify-between gap-2">
            <label className="label-text !mb-0 flex-1">
              {t('fullNameLabel')}
              <RequiredAsterisk />
            </label>
            <CopyValueButton value={watch('name') ?? ''} compact />
          </div>
          <input
            {...register('name', {
              required: t('nameRequired'),
              minLength: { value: 2, message: t('nameTooShort') },
              validate: (value) => {
                const trimmed = value.trim();
                if (!trimmed) return t('nameRequired');
                return /^[\p{L}][\p{L}\s.'-]*$/u.test(trimmed) || t('nameFormat');
              },
            })}
            placeholder={t('namePlaceholder')}
            className={cn('input-field', errors.name && 'border-red-500 ring-1 ring-red-400/40')}
          />
          {errors.name && (
            <p className="mt-1 text-xs font-600 text-red-600" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Relationship + DOB */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="mb-1">
              <label className="label-text">
                {t('relationshipLabel')}
                <RequiredAsterisk />
              </label>
            </div>
            <select
              {...register('relationship', { required: t('relationshipRequired') })}
              className={cn(
                'input-field',
                errors.relationship && 'border-red-500 ring-1 ring-red-400/40'
              )}
            >
              {MEMBER_RELATIONSHIP_VALUES.map((r) => (
                <option key={`rel-${r}`} value={r}>
                  {t(`relationshipOptions.${r}`)}
                </option>
              ))}
            </select>
            {errors.relationship && (
              <p className="mt-1 text-xs font-600 text-red-600" role="alert">
                {errors.relationship.message}
              </p>
            )}
          </div>
          <div>
            <div className="mb-1 flex items-start justify-between gap-2">
              <label className="label-text !mb-0 flex-1">{t('dobLabel')}</label>
              <CopyValueButton value={watch('dob') ?? ''} compact />
            </div>
            <input
              {...register('dob', {
                validate: (value) => {
                  if (!value) return true;
                  const d = new Date(`${value}T00:00:00`);
                  if (Number.isNaN(d.getTime())) return t('dobInvalid');
                  if (d.getFullYear() < 1900) return t('dobInvalid');
                  const today = new Date();
                  today.setHours(23, 59, 59, 999);
                  if (d > today) return t('dobFuture');
                  return true;
                },
              })}
              type="date"
              className={cn('input-field', errors.dob && 'border-red-500 ring-1 ring-red-400/40')}
            />
            {errors.dob && (
              <p className="mt-1 text-xs font-600 text-red-600" role="alert">
                {errors.dob.message}
              </p>
            )}
          </div>
        </div>

        <input type="hidden" {...register('photoDataUrl')} />

        {/* Avatar color */}
        <div>
          <div className="mb-1">
            <label className="label-text">{t('profileColor')}</label>
          </div>
          <p className="mb-2 text-xs text-vault-faint">{t('profileColorHint')}</p>
          <div className="grid grid-cols-8 gap-2">
            {MEMBER_COLORS.map((c) => (
              <button
                key={`color-${c.border}`}
                type="button"
                onClick={() => setValue('avatarColor', c.border)}
                className={`h-8 w-8 rounded-lg border border-[#212121]/14 shadow-[0_1px_2px_rgba(33,33,33,0.06)] transition-all duration-150 ${
                  selectedColor === c.border
                    ? 'scale-110 ring-2 ring-vault-warm ring-offset-2 ring-offset-vault-panel'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c.border }}
                title={c.name}
                aria-label={c.name}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-[color:var(--color-border)] pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            {tc('cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary min-w-[120px] justify-center"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
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
                {t('saving')}
              </span>
            ) : editMember ? (
              t('saveChanges')
            ) : (
              t('addMember')
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
