'use client';

import { useCallback, useState } from 'react';
import type { CategoryId } from '@/lib/storage';
import { runTesseractOnImage } from '@/lib/ocr/tesseractHelper';

export type ScanPhase = 'idle' | 'ocr' | 'api' | 'done' | 'error';

export interface ScanExtractResult {
  fields: Record<string, string>;
  confidence: Record<string, number>;
}

export function useDocumentScanner() {
  const [phase, setPhase] = useState<ScanPhase>('idle');
  const [progress, setProgress] = useState<{ status: string; progress: number }>({
    status: '',
    progress: 0,
  });
  const [result, setResult] = useState<ScanExtractResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setPhase('idle');
    setProgress({ status: '', progress: 0 });
    setResult(null);
    setError(null);
  }, []);

  const scan = useCallback(async (file: File, categoryId: CategoryId) => {
    setError(null);
    setResult(null);
    setPhase('ocr');
    setProgress({ status: 'Reading document on device…', progress: 0.02 });

    let ocrText: string;
    try {
      ocrText = await runTesseractOnImage(file, {
        onProgress: (p) => {
          setProgress({
            status: p.status,
            progress: 0.02 + Math.min(0.55, p.progress * 0.55),
          });
        },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'ocr_failed';
      setError(msg);
      setPhase('error');
      return;
    }

    if (!ocrText.trim()) {
      setError('No text was recognized. Try a clearer photo or better lighting.');
      setPhase('error');
      return;
    }

    setPhase('api');
    setProgress({ status: 'Extracting fields with AI…', progress: 0.6 });

    try {
      const res = await fetch('/api/ai/scan-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ocrText, categoryId }),
      });
      const data = (await res.json()) as ScanExtractResult & { error?: string; detail?: string };

      if (!res.ok) {
        const hint = data.detail ? ` — ${String(data.detail).slice(0, 200)}` : '';
        throw new Error((data.error || 'scan_api_failed') + hint);
      }

      setResult({ fields: data.fields || {}, confidence: data.confidence || {} });
      setProgress({ status: 'Done', progress: 1 });
      setPhase('done');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'api_failed';
      setError(msg);
      setPhase('error');
    }
  }, []);

  return { phase, progress, result, error, scan, reset };
}
