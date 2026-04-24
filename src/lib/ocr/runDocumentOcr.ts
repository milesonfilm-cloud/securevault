import { pdfFirstPageToPngBlob } from './pdfFirstPageToBlob';
import { runTesseractOnImage } from './tesseractHelper';

function isPdf(file: File): boolean {
  const n = file.name.toLowerCase();
  return file.type === 'application/pdf' || n.endsWith('.pdf');
}

export type OcrProgress = { status: string; progress: number };

export async function runDocumentOcr(
  file: File,
  options?: { onProgress?: (p: OcrProgress) => void }
): Promise<string> {
  let imageSource: File | Blob = file;
  if (isPdf(file)) {
    options?.onProgress?.({ status: 'Rendering PDF page…', progress: 0.05 });
    imageSource = await pdfFirstPageToPngBlob(await file.arrayBuffer());
  }

  return runTesseractOnImage(imageSource, {
    onProgress: (p) => {
      if (p.status === 'Reading text…') {
        options?.onProgress?.({ status: p.status, progress: 0.08 + p.progress * 0.9 });
      } else {
        options?.onProgress?.({ status: p.status, progress: p.progress });
      }
    },
  });
}
