'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import { FamilyMember } from '@/lib/storage';
import { MEMBER_AVATAR_COLORS } from '@/lib/memberAvatarColors';

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
    },
  });

  const selectedColor = watch('avatarColor');
  const watchedName = watch('name');

  useEffect(() => {
    if (editMember) {
      reset({
        name: editMember.name,
        relationship: editMember.relationship,
        dob: editMember.dob,
        avatarColor: editMember.avatarColor,
      });
    } else {
      reset({ name: '', relationship: 'Self', dob: '', avatarColor: MEMBER_AVATAR_COLORS[0] });
    }
  }, [editMember, isOpen, reset]);

  const onSubmit = (data: MemberFormData) => {
    onSave(data);
  };

  const initials =
    watchedName
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0] || '')
      .join('')
      .toUpperCase() || '?';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editMember ? 'Edit Family Member' : 'Add Family Member'}
      subtitle="Member profiles help organize documents by person"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
        {/* Avatar preview */}
        <div className="flex justify-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-700 text-xl shadow-lg transition-colors duration-200"
            style={{ backgroundColor: selectedColor }}
          >
            {initials}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="label-text">Full Name *</label>
          <input
            {...register('name', { required: 'Full name is required' })}
            placeholder="e.g. Arjun Sharma"
            className="input-field"
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
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

        {/* Avatar color */}
        <div>
          <label className="label-text">Profile Color</label>
          <p className="text-xs text-vault-faint mb-2">Used for avatar and document badges</p>
          <div className="flex flex-wrap gap-2">
            {MEMBER_AVATAR_COLORS.map((color) => (
              <button
                key={`color-${color}`}
                type="button"
                onClick={() => setValue('avatarColor', color)}
                className={`w-8 h-8 rounded-lg transition-all duration-150 ${
                  selectedColor === color
                    ? 'ring-2 ring-offset-2 ring-vault-warm ring-offset-[#48426D] scale-110'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-[rgba(255,255,255,0.07)]">
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
