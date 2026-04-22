import { argon2id } from 'hash-wasm';
import { base64ToBytes, bytesToBase64 } from './base64';

/** Salt length for KDF (256-bit). */
const KDF_SALT_BYTES = 32;

/**
 * Argon2id (v2) — OWASP-style memory-hard KDF, mobile/WebView friendly.
 * memoryKiB: kibibytes (1024 B) per hash-wasm / RFC 9106 style parameters.
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
 */
const ARGON2_TIME_COST = 3;
/** ~8 MiB — large enough for Argon2id strength; ~19 MiB was failing on low-RAM tabs / mobile WebViews. */
const ARGON2_MEMORY_KIB = 8192;
const ARGON2_PARALLELISM = 1;

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

/** Argon2id parameters for new vaults (native iOS/Android can reuse these fields). */
export type KdfParamsV2 = {
  v: 2;
  saltB64: string;
  /** Argon2 time cost (t). */
  iterations: number;
  /** Memory size in KiB (m). */
  memoryKiB: number;
  /** Parallelism / lanes (p). */
  parallelism: number;
};

export type KdfParams = KdfParamsV1 | KdfParamsV2;

export type EncryptedPayloadV1 = {
  v: 1;
  ivB64: string;
  ctB64: string;
};

async function sha256(bytes: Uint8Array): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest('SHA-256', toArrayBuffer(bytes));
  return new Uint8Array(digest);
}

/** New installs: Argon2id + AES-256-GCM (params JSON is portable to native apps). */
export function newKdfParams(): KdfParamsV2 {
  const salt = crypto.getRandomValues(new Uint8Array(KDF_SALT_BYTES));
  return {
    v: 2,
    saltB64: bytesToBase64(salt),
    iterations: ARGON2_TIME_COST,
    memoryKiB: ARGON2_MEMORY_KIB,
    parallelism: ARGON2_PARALLELISM,
  };
}

export function parseKdfParamsJson(raw: string): KdfParams | null {
  let o: unknown;
  try {
    o = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!o || typeof o !== 'object' || o === null) return null;
  const r = o as Record<string, unknown>;
  if (typeof r.saltB64 !== 'string') return null;
  const iterations = r.iterations;
  if (typeof iterations !== 'number' || iterations < 1 || !Number.isFinite(iterations)) return null;

  if (r.v === 2) {
    const memoryKiB = r.memoryKiB;
    const parallelism = r.parallelism;
    if (typeof memoryKiB !== 'number' || memoryKiB < 8192 || !Number.isFinite(memoryKiB)) {
      return null;
    }
    const p =
      typeof parallelism === 'number' && parallelism >= 1 && Number.isFinite(parallelism)
        ? parallelism
        : 1;
    return {
      v: 2,
      saltB64: r.saltB64,
      iterations,
      memoryKiB,
      parallelism: p,
    };
  }

  if (r.v === 1 || r.v === undefined) {
    return { v: 1, saltB64: r.saltB64, iterations };
  }

  return null;
}

async function deriveAesKeyFromPinPbkdf2(pin: string, params: KdfParamsV1): Promise<CryptoKey> {
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

async function deriveAesKeyFromPinArgon2id(pin: string, params: KdfParamsV2): Promise<CryptoKey> {
  const salt = base64ToBytes(params.saltB64);
  const raw = await argon2id({
    password: pin,
    salt,
    parallelism: params.parallelism,
    iterations: params.iterations,
    memorySize: params.memoryKiB,
    hashLength: 32,
    outputType: 'binary',
  });
  return await crypto.subtle.importKey(
    'raw',
    toArrayBuffer(raw),
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function deriveAesKeyFromPin(pin: string, params: KdfParams): Promise<CryptoKey> {
  if (params.v === 2) {
    return deriveAesKeyFromPinArgon2id(pin, params);
  }
  return deriveAesKeyFromPinPbkdf2(pin, params);
}

export async function computePinVerifier(key: CryptoKey): Promise<string> {
  const raw = new Uint8Array(await crypto.subtle.exportKey('raw', key));
  const digest = await sha256(raw);
  return bytesToBase64(digest);
}

const VERIFIER_DIGEST_BYTES = 32;

/** Constant-time compare for stored PIN verifier (mitigates timing leaks on password check). */
export async function timingSafeEqualVerifierB64(aB64: string, bB64: string): Promise<boolean> {
  let a: Uint8Array;
  let b: Uint8Array;
  try {
    a = base64ToBytes(aB64);
    b = base64ToBytes(bB64);
  } catch {
    return false;
  }
  if (a.byteLength !== VERIFIER_DIGEST_BYTES || b.byteLength !== VERIFIER_DIGEST_BYTES) {
    return false;
  }
  const av = Uint8Array.from(a);
  const bv = Uint8Array.from(b);
  const subtle = crypto.subtle as SubtleCrypto & {
    timingSafeEqual?: (x: BufferSource, y: BufferSource) => Promise<boolean>;
  };
  if (typeof subtle.timingSafeEqual === 'function') {
    try {
      return await subtle.timingSafeEqual(av as BufferSource, bv as BufferSource);
    } catch {
      /* fall through */
    }
  }
  let x = 0;
  for (let i = 0; i < VERIFIER_DIGEST_BYTES; i++) x |= av[i] ^ bv[i];
  return x === 0;
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
