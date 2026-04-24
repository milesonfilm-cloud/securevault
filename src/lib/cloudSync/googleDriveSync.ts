/**
 * Google Drive appDataFolder sync — uploads the **already-encrypted** vault record JSON.
 * OAuth access token must live in sessionStorage only (`sv_gdrive_token`).
 */

import type { EncryptedVaultRecordV1 } from '@/lib/db';
import { idbGetEncryptedVaultRecord, idbPutEncryptedVaultRecord } from '@/lib/db';

const FILE_NAME = 'securevault_backup.enc';
const TOKEN_KEY = 'sv_gdrive_token';
const META_KEY = 'sv_gdrive_last_sync';

export function getStoredAccessToken(): string | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredAccessToken(token: string | null): void {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export function getLastSyncTime(): number | null {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(META_KEY);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function setLastSyncTime(ts: number): void {
  try {
    sessionStorage.setItem(META_KEY, String(ts));
  } catch {
    /* ignore */
  }
}

function recordToBlob(record: EncryptedVaultRecordV1): Blob {
  return new Blob([JSON.stringify(record)], { type: 'application/json' });
}

async function findFileId(accessToken: string): Promise<string | null> {
  const q = encodeURIComponent(`name='${FILE_NAME}' and trashed=false`);
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&spaces=appDataFolder&fields=files(id,name)`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) return null;
  const json = (await res.json()) as { files?: { id: string }[] };
  return json.files?.[0]?.id ?? null;
}

export async function uploadBackup(accessToken: string): Promise<void> {
  const record = await idbGetEncryptedVaultRecord();
  if (!record) throw new Error('no_encrypted_vault');

  const boundary = 'sv_boundary';
  const delimiter = `\r\n--${boundary}\r\n`;
  const close = `\r\n--${boundary}--`;

  const metadata = {
    name: FILE_NAME,
    parents: ['appDataFolder'],
  };

  const bodyParts = [
    delimiter,
    'Content-Type: application/json; charset=UTF-8\r\n\r\n',
    JSON.stringify(metadata),
    delimiter,
    'Content-Type: application/octet-stream\r\n\r\n',
  ];

  const blob = recordToBlob(record);
  const multipartBody = new Blob([...bodyParts.map((p) => new Blob([p])), blob, new Blob([close])], {
    type: `multipart/related; boundary=${boundary}`,
  });

  const existingId = await findFileId(accessToken);
  if (existingId) {
    const up = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${existingId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/octet-stream',
        },
        body: blob,
      }
    );
    if (!up.ok) throw new Error(`drive_upload_failed:${up.status}`);
  } else {
    const cr = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartBody,
      }
    );
    if (!cr.ok) throw new Error(`drive_create_failed:${cr.status}`);
  }

  setLastSyncTime(Date.now());
}

export async function downloadLatestBackup(accessToken: string): Promise<EncryptedVaultRecordV1 | null> {
  const id = await findFileId(accessToken);
  if (!id) return null;
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const text = await res.text();
  try {
    const parsed = JSON.parse(text) as EncryptedVaultRecordV1;
    if (parsed?.v === 1 && parsed.payload) return parsed;
  } catch {
    return null;
  }
  return null;
}

export async function restoreBackupToIdb(
  accessToken: string,
  opts?: { conflictRemoteModified?: number }
): Promise<'restored' | 'noop'> {
  const remote = await downloadLatestBackup(accessToken);
  if (!remote) return 'noop';

  const local = await idbGetEncryptedVaultRecord();
  const localTs = local ? 0 : 0;
  void localTs;
  void opts;

  await idbPutEncryptedVaultRecord(remote);
  setLastSyncTime(Date.now());
  return 'restored';
}

export async function runDriveSyncIfPossible(enabled: boolean): Promise<void> {
  if (!enabled || typeof window === 'undefined') return;
  const token = getStoredAccessToken();
  if (!token) return;
  await uploadBackup(token);
}
