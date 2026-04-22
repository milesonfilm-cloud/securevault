import { pdfFirstPageToPngBlob } from './pdfFirstPageToBlob';

function isPdf(file: File): boolean {
  const n = file.name.toLowerCase();
  return file.type === 'application/pdf' || n.endsWith('.pdf');
}

export type OcrProgress = { status: string; progress: number };

export async function runDocumentOcr(
  file: File,
  options?: { onProgress?: (p: OcrProgress) => void }
): Promise<string> {
  const { createWorker } = await import('tesseract.js');
  let imageSource: File | Blob = file;
  if (isPdf(file)) {
    options?.onProgress?.({ status: 'Rendering PDF page…', progress: 0.05 });
    imageSource = await pdfFirstPageToPngBlob(await file.arrayBuffer());
  }

  const logger = (m: { status: string; progress: number }) => {
    if (m.status === 'recognizing text') {
      options?.onProgress?.({ status: 'Reading text…', progress: 0.08 + m.progress * 0.9 });
    } else if (typeof m.progress === 'number') {
      options?.onProgress?.({ status: String(m.status), progress: m.progress });
    }
  };

  let worker;
  try {
    worker = await createWorker('eng+hin', undefined, { logger });
  } catch {
    worker = await createWorker('eng', undefined, { logger });
  }
  try {
    await worker.setParameters({ tessedit_pageseg_mode: '6', preserve_interword_spaces: '1' });
    const {
      data: { text },
    } = await worker.recognize(imageSource);
    return text || '';
  } finally {
    await worker.terminate();
  }
}
