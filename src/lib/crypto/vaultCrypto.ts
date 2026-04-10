import { base64ToBytes, bytesToBase64 } from './base64';

const PBKDF2_ITERATIONS = 310_000;

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const out = new Uint8Array(bytes.byteLength);
  out.set(bytes);
  return out.buffer;
}

export type KdfParamsV1 = {
  v: 1;
  saltB64: string;
  iterations: number;
};

export type EncryptedPayloadV1 = {
  v: 1;
  ivB64: string;
  ctB64: string;
};

async function sha256(bytes: Uint8Array): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest('SHA-256', toArrayBuffer(bytes));
  return new Uint8Array(digest);
}

export function newKdfParams(): KdfParamsV1 {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return { v: 1, saltB64: bytesToBase64(salt), iterations: PBKDF2_ITERATIONS };
}

export async function deriveAesKeyFromPin(pin: string, params: KdfParamsV1): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, [
    'deriveKey',
  ]);
  const salt = base64ToBytes(params.saltB64);
  const saltBuf = toArrayBuffer(salt);
  return await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: saltBuf, iterations: params.iterations, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function computePinVerifier(key: CryptoKey): Promise<string> {
  const raw = new Uint8Array(await crypto.subtle.exportKey('raw', key));
  const digest = await sha256(raw);
  return bytesToBase64(digest);
}

export async function encryptJson(key: CryptoKey, value: unknown): Promise<EncryptedPayloadV1> {
  const iv = new Uint8Array(crypto.getRandomValues(new Uint8Array(12)));
  const plain = new TextEncoder().encode(JSON.stringify(value));
  const ct = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, toArrayBuffer(plain))
  );
  return { v: 1, ivB64: bytesToBase64(iv), ctB64: bytesToBase64(ct) };
}

export async function decryptJson<T>(key: CryptoKey, payload: EncryptedPayloadV1): Promise<T> {
  const iv = new Uint8Array(base64ToBytes(payload.ivB64));
  const ct = base64ToBytes(payload.ctB64);
  const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, toArrayBuffer(ct));
  const txt = new TextDecoder().decode(new Uint8Array(plainBuf));
  return JSON.parse(txt) as T;
}

export async function encryptBytes(key: CryptoKey, bytes: Uint8Array): Promise<EncryptedPayloadV1> {
  const iv = new Uint8Array(crypto.getRandomValues(new Uint8Array(12)));
  const ct = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, toArrayBuffer(bytes))
  );
  return { v: 1, ivB64: bytesToBase64(iv), ctB64: bytesToBase64(ct) };
}

export async function decryptBytes(
  key: CryptoKey,
  payload: EncryptedPayloadV1
): Promise<Uint8Array> {
  const iv = new Uint8Array(base64ToBytes(payload.ivB64));
  const ct = base64ToBytes(payload.ctB64);
  const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, toArrayBuffer(ct));
  return new Uint8Array(plainBuf);
}
