export type TesseractProgress = { status: string; progress: number };

/**
 * Run Tesseract on an image blob. Tries `eng+hin` first, falls back to `eng`.
 * Worker is always terminated when done.
 */
export async function runTesseractOnImage(
  imageSource: File | Blob,
  options?: { onProgress?: (p: TesseractProgress) => void }
): Promise<string> {
  const Tesseract = (await import('tesseract.js')).default;
  const { createWorker } = Tesseract;

  const logger = (m: { status: string; progress: number }) => {
    if (m.status === 'recognizing text' && typeof m.progress === 'number') {
      options?.onProgress?.({ status: 'Reading text…', progress: m.progress });
    } else if (typeof m.progress === 'number') {
      options?.onProgress?.({ status: String(m.status), progress: m.progress });
    }
  };

  let worker: Awaited<ReturnType<typeof createWorker>>;
  try {
    worker = await createWorker('eng+hin', undefined, { logger });
  } catch {
    worker = await createWorker('eng', undefined, { logger });
  }

  try {
    await worker.setParameters({
      tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
      preserve_interword_spaces: '1',
    });
    const {
      data: { text },
    } = await worker.recognize(imageSource);
    return text || '';
  } finally {
    await worker.terminate();
  }
}
