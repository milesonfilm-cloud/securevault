'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/ui/Modal';
import { CATEGORIES, getCategoryById } from '@/lib/categories';
import { Document, FamilyMember } from '@/lib/storage';
import { CategoryId } from '@/lib/storage';

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
}

export default function DocumentFormModal({
  isOpen,
  onClose,
  onSave,
  editDoc,
  members,
}: DocumentFormModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    reset,
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

  const passwordFieldKey = useMemo(() => {
    if (!categoryConfig) return null;
    return categoryConfig.fields.find((f) => f.key === 'Password')?.key || null;
  }, [categoryConfig]);

  useEffect(() => {
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
      reset({
        memberId: members[0]?.id || '',
        categoryId: 'government-ids',
        title: '',
        notes: '',
        tags: '',
      });
    }
  }, [editDoc, isOpen, members, reset]);

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
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editDoc ? 'Edit Document' : 'Add New Document'}
      subtitle="All data is saved locally on your device only"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
        {/* Basic info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text">Family Member *</label>
            <select
              {...register('memberId', { required: 'Select a family member' })}
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
            <label className="label-text">Category *</label>
            <select
              {...register('categoryId', { required: 'Select a category' })}
              className="input-field"
            >
              {CATEGORIES.map((cat) => (
                <option key={`form-cat-${cat.id}`} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label-text">Document Title *</label>
          <p className="text-xs text-slate-400 mb-1.5">
            A memorable name — e.g. &quot;Aadhaar Card&quot; or &quot;HDFC Salary Account&quot;
          </p>
          <input
            {...register('title', { required: 'Document title is required' })}
            placeholder="e.g. Aadhaar Card"
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
                {categoryConfig.label} Fields
              </span>
              <div
                className="h-px flex-1"
                style={{ backgroundColor: `${categoryConfig.color}30` }}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categoryConfig.fields.map((field) => (
                <div key={`form-field-${field.key}`}>
                  <label className="label-text">
                    {field.label}
                    {field.required && <span className="text-red-400 ml-0.5">*</span>}
                    {field.sensitive && (
                      <span className="ml-1.5 text-xs text-amber-500 font-400">(sensitive)</span>
                    )}
                  </label>
                  {field.type === 'select' && field.options ? (
                    <select
                      {...register(field.key, {
                        required: field.required ? `${field.label} is required` : false,
                      })}
                      className="input-field"
                    >
                      <option value="">Select...</option>
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
                          required: field.required ? `${field.label} is required` : false,
                        })}
                        type={
                          isPasswordCategory && field.key === passwordFieldKey
                            ? showPassword
                              ? 'text'
                              : 'password'
                            : field.type
                        }
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
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
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          title={showPassword ? 'Hide password' : 'Show password'}
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
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="label-text">Notes</label>
          <p className="text-xs text-slate-400 mb-1.5">
            Optional — reminders, linked contacts, etc.
          </p>
          <textarea
            {...register('notes')}
            rows={2}
            placeholder="e.g. Linked to mobile 98765XXXXX"
            className="input-field resize-none"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="label-text">Tags</label>
          <p className="text-xs text-slate-400 mb-1.5">
            Comma-separated — e.g. primary, kyc, travel
          </p>
          <input {...register('tags')} placeholder="primary, kyc, travel" className="input-field" />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
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
            ) : editDoc ? (
              'Save Changes'
            ) : (
              'Add Document'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
