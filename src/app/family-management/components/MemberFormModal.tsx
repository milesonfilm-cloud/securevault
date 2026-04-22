'use client';

import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Camera, X } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { FamilyMember } from '@/lib/storage';
import { MEMBER_AVATAR_COLORS } from '@/lib/memberAvatarColors';
import { resizeImageFileToJpegDataUrl } from '@/lib/memberPhoto';
import MemberAvatar from '@/components/MemberAvatar';

const RELATIONSHIPS = [
  'Self',
  'Spouse',
  'Son',
  'Daughter',
  'Father',
  'Mother',
  'Brother',
  'Sister',
  'Grandfather',
  'Grandmother',
  'Other',
];

interface MemberFormData {
  name: string;
  relationship: string;
  dob: string;
  avatarColor: string;
  /** Empty string when no photo (RHF + hidden input). */
  photoDataUrl: string;
}

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editMember?: FamilyMember | null;
}

export default function MemberFormModal({
  isOpen,
  onClose,
  onSave,
  editMember,
}: MemberFormModalProps) {
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
      relationship: 'Self',
      dob: '',
      avatarColor: MEMBER_AVATAR_COLORS[0],
      photoDataUrl: '',
    },
  });

  const selectedColor = watch('avatarColor');
  const watchedName = watch('name');
  const photoDataUrl = watch('photoDataUrl');

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
        relationship: 'Self',
        dob: '',
        avatarColor: MEMBER_AVATAR_COLORS[0],
        photoDataUrl: '',
      });
    }
  }, [editMember, isOpen, reset]);

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
      toast.error(err instanceof Error ? err.message : 'Could not add photo');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editMember ? 'Edit Family Member' : 'Add Family Member'}
      subtitle="Member profiles help organize documents by person"
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
              {photoDataUrl ? 'Change photo' : 'Add photo'}
            </button>
            {photoDataUrl ? (
              <button
                type="button"
                onClick={() => setValue('photoDataUrl', '', { shouldDirty: true })}
                className="inline-flex items-center gap-1 rounded-xl border border-[color:var(--color-border)] px-3 py-2 text-xs font-600 text-vault-muted transition-colors hover:bg-vault-elevated hover:text-vault-text"
              >
                <X size={14} />
                Remove
              </button>
            ) : null}
          </div>
          <p className="max-w-xs text-center text-[11px] text-vault-faint">
            Photos are stored locally in your vault and resized to save space.
          </p>
        </div>

        {/* Name */}
        <div>
          <label className="label-text">Full Name *</label>
          <input
            {...register('name', { required: 'Full name is required' })}
            placeholder="e.g. Arjun Sharma"
            className="input-field"
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>

        {/* Relationship + DOB */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">Relationship *</label>
            <select
              {...register('relationship', { required: 'Select relationship' })}
              className="input-field"
            >
              {RELATIONSHIPS.map((r) => (
                <option key={`rel-${r}`} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">Date of Birth</label>
            <input {...register('dob')} type="date" className="input-field" />
          </div>
        </div>

        <input type="hidden" {...register('photoDataUrl')} />

        {/* Avatar color */}
        <div>
          <label className="label-text">Profile Color</label>
          <p className="mb-2 text-xs text-vault-faint">Used when no photo is set, and for document badges</p>
          <div className="flex flex-wrap gap-2">
            {MEMBER_AVATAR_COLORS.map((color) => (
              <button
                key={`color-${color}`}
                type="button"
                onClick={() => setValue('avatarColor', color)}
                className={`h-8 w-8 rounded-lg transition-all duration-150 ${
                  selectedColor === color
                    ? 'scale-110 ring-2 ring-vault-warm ring-offset-2 ring-offset-vault-panel'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-[color:var(--color-border)] pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
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
                Saving...
              </span>
            ) : editMember ? (
              'Save Changes'
            ) : (
              'Add Member'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
