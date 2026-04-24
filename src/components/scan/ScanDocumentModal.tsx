'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Camera, ImagePlus, Loader2, ScanLine, StopCircle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { CATEGORIES, getCategoryById } from '@/lib/categories';
import { AI_SCAN_CATEGORY_IDS } from '@/lib/scan/aiScanCategories';
import type { DocumentPrefill } from '@/lib/ocr/documentPrefill';
import type { CategoryId } from '@/lib/storage';
import { useDocumentScanner } from '@/hooks/useDocumentScanner';

const SCAN_CATEGORIES = CATEGORIES.filter((c) =>
  (AI_SCAN_CATEGORY_IDS as string[]).includes(c.id)
);

export interface ScanDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (payload: { categoryId: CategoryId; prefill: DocumentPrefill }) => void;
}

export default function ScanDocumentModal({ isOpen, onClose, onApply }: ScanDocumentModalProps) {
  const [categoryId, setCategoryId] = useState<CategoryId>('government-ids');
  const { phase, progress, result, error, scan, reset } = useDocumentScanner();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [webcamOn, setWebcamOn] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      reset();
      setWebcamOn(false);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
    }
  }, [isOpen, reset]);

  const stopWebcam = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setWebcamOn(false);
  }, []);

  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setWebcamOn(true);
    } catch {
      /* user denied or no camera */
    }
  }, []);

  const captureFromWebcam = useCallback(() => {
    const v = videoRef.current;
    if (!v || v.videoWidth === 0) return;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(v, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        stopWebcam();
        void scan(new File([blob], `scan-${Date.now()}.jpg`, { type: 'image/jpeg' }), categoryId);
      },
      'image/jpeg',
      0.92
    );
  }, [categoryId, scan, stopWebcam]);

  const onFileChosen = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      e.target.value = '';
      if (!f || !f.type.startsWith('image/')) return;
      void scan(f, categoryId);
    },
    [categoryId, scan]
  );

  const handleApply = () => {
    if (!result) return;
    const cat = getCategoryById(categoryId);
    const titleBase = cat?.shortLabel || cat?.label || 'Document';
    const filledKeys = Object.entries(result.fields)
      .filter(([, v]) => v && String(v).trim() !== '')
      .map(([k]) => k);

    onApply({
      categoryId,
      prefill: {
        categoryId,
        title: `${titleBase} (scan)`,
        fields: result.fields,
        fromAiScan: true,
        aiFilledFieldKeys: filledKeys,
        aiConfidence: result.confidence,
        notesAppend: 'Imported from AI camera scan — verify all fields.',
      },
    });
    onClose();
  };

  const busy = phase === 'ocr' || phase === 'api';
  const showPreview = phase === 'done' && result;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Scan document with AI"
      subtitle="OCR runs on your device; extracted text is sent to AI to map fields. Review before saving."
      size="lg"
    >
      <div className="space-y-5 p-6">
        <div>
          <label className="label-text">Document category</label>
          <select
            className="input-field mt-1"
            value={categoryId}
            disabled={busy}
            onChange={(e) => setCategoryId(e.target.value as CategoryId)}
          >
            {SCAN_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-[11px] text-vault-faint">
            Aadhaar, PAN, passport, license, RC, insurance, bank docs, and similar use these categories.
          </p>
        </div>

        {!showPreview && (
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              disabled={busy}
              onClick={() => cameraInputRef.current?.click()}
              className="btn-primary inline-flex flex-1 items-center justify-center gap-2 py-2.5 min-w-[140px]"
            >
              <Camera size={18} />
              Camera / capture
            </button>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={onFileChosen}
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => galleryInputRef.current?.click()}
              className="btn-secondary inline-flex flex-1 items-center justify-center gap-2 py-2.5 min-w-[140px]"
            >
              <ImagePlus size={18} />
              Gallery
            </button>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChosen}
            />
          </div>
        )}

        {!busy && !showPreview && typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia && (
          <div className="rounded-xl border border-[color:var(--color-border)] bg-vault-elevated/50 p-4">
            <p className="text-xs font-semibold text-vault-muted mb-2">Live camera (optional)</p>
            {!webcamOn ? (
              <button type="button" onClick={startWebcam} className="btn-secondary text-sm py-2 px-4">
                Start webcam
              </button>
            ) : (
              <div className="space-y-3">
                <video ref={videoRef} className="w-full max-h-[220px] rounded-lg bg-black object-contain" muted playsInline />
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={captureFromWebcam} className="btn-primary text-sm py-2 px-4 inline-flex items-center gap-2">
                    <ScanLine size={16} />
                    Use frame
                  </button>
                  <button type="button" onClick={stopWebcam} className="btn-secondary text-sm py-2 px-4 inline-flex items-center gap-2">
                    <StopCircle size={16} />
                    Stop
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {busy && (
          <div className="flex items-center gap-3 rounded-xl border border-[color:var(--color-border)] bg-vault-elevated/60 px-4 py-4">
            <Loader2 className="h-6 w-6 shrink-0 animate-spin text-vault-warm" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-vault-text">{progress.status}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-vault-panel">
                <div
                  className="h-full rounded-full bg-vault-warm transition-all duration-300"
                  style={{ width: `${Math.round(progress.progress * 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {showPreview && result && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-vault-text">Extracted preview</p>
            <div className="max-h-[240px] overflow-y-auto rounded-xl border border-[color:var(--color-border)] bg-vault-elevated/40">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-vault-panel text-vault-muted uppercase tracking-wide">
                  <tr>
                    <th className="px-3 py-2">Field</th>
                    <th className="px-3 py-2">Value</th>
                    <th className="px-3 py-2 w-20">Conf.</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(result.fields).map(([key, val]) => (
                    <tr key={key} className="border-t border-[color:var(--color-border)]">
                      <td className="px-3 py-2 text-vault-muted align-top">{key}</td>
                      <td className="px-3 py-2 text-vault-text align-top break-all">{val || '—'}</td>
                      <td className="px-3 py-2 text-vault-faint align-top tabular-nums">
                        {Math.round((result.confidence[key] ?? 0) * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-vault-faint">
              Values open in the add-document form with yellow “AI filled” badges. Edit anything before saving.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <button type="button" onClick={onClose} className="btn-secondary" disabled={busy}>
            Cancel
          </button>
          {showPreview ? (
            <button type="button" onClick={handleApply} className="btn-primary min-w-[160px] justify-center">
              Apply to form
            </button>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
