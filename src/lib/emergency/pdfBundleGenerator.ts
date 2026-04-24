import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Document } from '@/lib/storage';
import { getCategoryById } from '@/lib/categories';
import { encryptBytes, type EncryptedPayloadV1 } from '@/lib/crypto/vaultCrypto';
import { bytesToBase64 } from '@/lib/crypto/base64';

function toArrayBuffer(u8: Uint8Array): ArrayBuffer {
  const b = new ArrayBuffer(u8.byteLength);
  new Uint8Array(b).set(u8);
  return b;
}

async function deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, [
    'deriveKey',
  ]);
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: toArrayBuffer(salt),
      iterations: 120_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

export type EmergencyPdfRow = {
  doc: Document;
  memberName: string;
};

type JsPdfTable = jsPDF & { lastAutoTable?: { finalY: number } };

export async function generateEmergencyPDF(rows: EmergencyPdfRow[]): Promise<Uint8Array> {
  const docPdf = new jsPDF({ unit: 'pt', format: 'a4' });

  docPdf.setFontSize(18);
  docPdf.text('SecureVault — Emergency bundle', 40, 48);
  docPdf.setFontSize(10);
  docPdf.setTextColor(90, 90, 90);
  docPdf.text(`Generated ${new Date().toLocaleString()} — keep this file private.`, 40, 68);
  docPdf.setTextColor(0, 0, 0);

  const appUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/landing` : 'https://securevault.app';
  docPdf.setFontSize(9);
  docPdf.text(`App link: ${appUrl}`, 40, 88);

  let y = 110;

  for (const { doc, memberName } of rows) {
    const cat = getCategoryById(doc.categoryId);
    const catLabel = cat?.label ?? doc.categoryId;

    if (y > docPdf.internal.pageSize.getHeight() - 100) {
      docPdf.addPage();
      y = 48;
    }

    docPdf.setFontSize(12);
    docPdf.setFont('helvetica', 'bold');
    docPdf.text(doc.title, 40, y);
    y += 16;
    docPdf.setFont('helvetica', 'normal');
    docPdf.setFontSize(9);
    docPdf.text(`Category: ${catLabel} · Member: ${memberName}`, 40, y);
    y += 16;

    const tableBody: string[][] = Object.entries(doc.fields).map(([k, v]) => [k, v ?? '']);
    autoTable(docPdf, {
      startY: y,
      head: [['Field', 'Value']],
      body: tableBody,
      margin: { left: 40, right: 40 },
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [49, 44, 81] },
    });
    const j = docPdf as JsPdfTable;
    y = (j.lastAutoTable?.finalY ?? y) + 24;

    if (doc.notes?.trim()) {
      if (y > docPdf.internal.pageSize.getHeight() - 40) {
        docPdf.addPage();
        y = 48;
      }
      docPdf.setFontSize(8);
      docPdf.setTextColor(80, 80, 80);
      docPdf.text(`Notes: ${doc.notes}`, 40, y);
      docPdf.setTextColor(0, 0, 0);
      y += 28;
    }
  }

  const out = docPdf.output('arraybuffer');
  return new Uint8Array(out);
}

export type EncryptedPdfBundle = {
  v: 1;
  saltB64: string;
  kdfIterations: number;
  payload: EncryptedPayloadV1;
};

export async function encryptPdfBytesWithPassword(
  pdfBytes: Uint8Array,
  password: string
): Promise<EncryptedPdfBundle> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKeyFromPassword(password, salt);
  const payload = await encryptBytes(key, pdfBytes);
  return {
    v: 1,
    saltB64: bytesToBase64(salt),
    kdfIterations: 120_000,
    payload,
  };
}

export function encryptedBundleToDownloadBlob(bundle: EncryptedPdfBundle): Blob {
  return new Blob([JSON.stringify(bundle)], { type: 'application/json' });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
