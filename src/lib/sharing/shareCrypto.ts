/** Client-side encrypt/decrypt for share links. Key material is base64url in URL hash only. */

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64urlToBytes(s: string): Uint8Array {
  const pad = '='.repeat((4 - (s.length % 4)) % 4);
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function importShareKeyMaterial(b64urlKey: string): Promise<CryptoKey> {
  const raw = b64urlToBytes(b64urlKey);
  return crypto.subtle.importKey('raw', raw as BufferSource, { name: 'AES-GCM', length: 256 }, false, [
    'encrypt',
    'decrypt',
  ]);
}

export type SharePayload = {
  docTitle: string;
  categoryId: string;
  fields: Record<string, string>;
  sensitiveKeys: string[];
};

export async function encryptSharePayload(
  key: CryptoKey,
  payload: SharePayload
): Promise<{ ivB64: string; ctB64: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(payload)))
  );
  const ivB64 = btoa(String.fromCharCode(...iv));
  const ctB64 = btoa(String.fromCharCode(...ct));
  return { ivB64, ctB64 };
}

export async function decryptSharePayload(
  key: CryptoKey,
  ivB64: string,
  ctB64: string
): Promise<SharePayload> {
  const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0));
  const ct = Uint8Array.from(atob(ctB64), (c) => c.charCodeAt(0));
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  return JSON.parse(dec.decode(plain)) as SharePayload;
}

export async function encryptJsonPayload(
  key: CryptoKey,
  payload: unknown
): Promise<{ ivB64: string; ctB64: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(payload)))
  );
  const ivB64 = btoa(String.fromCharCode(...iv));
  const ctB64 = btoa(String.fromCharCode(...ct));
  return { ivB64, ctB64 };
}

export async function decryptJsonPayload<T>(
  key: CryptoKey,
  ivB64: string,
  ctB64: string
): Promise<T> {
  const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0));
  const ct = Uint8Array.from(atob(ctB64), (c) => c.charCodeAt(0));
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  return JSON.parse(dec.decode(plain)) as T;
}

export function randomShareKeyB64Url(): string {
  const raw = crypto.getRandomValues(new Uint8Array(32));
  const b64 = btoa(String.fromCharCode(...raw));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
