import { pdfFirstPageToPngBlob } from '@/lib/ocr/pdfFirstPageToBlob';
import { runTesseractOnImage } from '@/lib/ocr/tesseractHelper';

const PDFJS_VERSION = '5.6.205';

function isPdf(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

function isDocx(file: File): boolean {
  return (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.name.toLowerCase().endsWith('.docx')
  );
}

function isLegacyDoc(file: File): boolean {
  return file.type === 'application/msword' || file.name.toLowerCase().endsWith('.doc');
}

async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`;
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  let full = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    for (const item of tc.items) {
      if (item && typeof item === 'object' && 'str' in item) {
        full += `${(item as { str: string }).str} `;
      }
    }
    full += '\n';
  }
  return full.replace(/\s+/g, ' ').trim();
}

/**
 * Pull plain text from a PDF or Word file for AI field mapping.
 * Legacy `.doc` (binary) is not supported — user should save as `.docx` or PDF.
 */
export async function extractTextFromImportFile(file: File): Promise<string> {
  const buf = await file.arrayBuffer();

  if (isLegacyDoc(file)) {
    throw new Error('legacy_doc');
  }

  if (isPdf(file)) {
    let text = await extractPdfText(buf);
    if (text.length >= 40) return text;

    const png = await pdfFirstPageToPngBlob(buf);
    const imageFile = new File([png], 'page1.png', { type: 'image/png' });
    text = await runTesseractOnImage(imageFile, {
      onProgress: () => {},
    });
    return text.trim();
  }

  if (isDocx(file)) {
    const mammothMod = await import('mammoth');
    const extractRawText =
      'extractRawText' in mammothMod && typeof mammothMod.extractRawText === 'function'
        ? mammothMod.extractRawText
        : (
            mammothMod as unknown as {
              default: {
                extractRawText: (input: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }>;
              };
            }
          ).default.extractRawText;
    const { value } = await extractRawText({ arrayBuffer: buf });
    return value.replace(/\s+/g, ' ').trim();
  }

  throw new Error('unsupported_type');
}

export const IMPORT_FILE_ACCEPT =
  '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
