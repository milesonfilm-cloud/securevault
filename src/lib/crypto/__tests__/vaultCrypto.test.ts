import { describe, it, expect } from 'vitest';
import {
  newKdfParams,
  deriveAesKeyFromPin,
  computePinVerifier,
  timingSafeEqualVerifierB64,
  encryptJson,
  decryptJson,
  encryptBytes,
  decryptBytes,
  parseKdfParamsJson,
} from '../vaultCrypto';

describe('vaultCrypto', () => {
  it('newKdfParams returns valid v2 params', () => {
    const p = newKdfParams();
    expect(p.v).toBe(2);
    expect(p.memoryKiB).toBeGreaterThanOrEqual(8192);
    expect(p.iterations).toBeGreaterThanOrEqual(3);
    expect(p.saltB64).toBeTruthy();
  });

  it('parseKdfParamsJson rejects tampered memoryKiB', () => {
    const p = newKdfParams();
    const tampered = JSON.stringify({ ...p, memoryKiB: 512 });
    expect(parseKdfParamsJson(tampered)).toBeNull();
  });

  it('derives same key from same pin+params', async () => {
    const params = newKdfParams();
    const k1 = await deriveAesKeyFromPin('test-pin-123', params);
    const k2 = await deriveAesKeyFromPin('test-pin-123', params);
    const v1 = await computePinVerifier(k1);
    const v2 = await computePinVerifier(k2);
    expect(await timingSafeEqualVerifierB64(v1, v2)).toBe(true);
  });

  it('different pins produce different verifiers', async () => {
    const params = newKdfParams();
    const k1 = await deriveAesKeyFromPin('correct-pin', params);
    const k2 = await deriveAesKeyFromPin('wrong-pin', params);
    const v1 = await computePinVerifier(k1);
    const v2 = await computePinVerifier(k2);
    expect(await timingSafeEqualVerifierB64(v1, v2)).toBe(false);
  });

  it('encryptJson / decryptJson roundtrip', async () => {
    const params = newKdfParams();
    const key = await deriveAesKeyFromPin('roundtrip-test', params);
    const payload = { name: 'Aadhaar', number: '1234-5678-9012' };
    const encrypted = await encryptJson(key, payload);
    const decrypted = await decryptJson<typeof payload>(key, encrypted);
    expect(decrypted).toEqual(payload);
  });

  it('encryptJson produces unique IVs each time', async () => {
    const params = newKdfParams();
    const key = await deriveAesKeyFromPin('iv-test', params);
    const e1 = await encryptJson(key, { a: 1 });
    const e2 = await encryptJson(key, { a: 1 });
    expect(e1.ivB64).not.toBe(e2.ivB64);
  });

  it('decryptJson throws on wrong key', async () => {
    const params = newKdfParams();
    const k1 = await deriveAesKeyFromPin('key-one', params);
    const k2 = await deriveAesKeyFromPin('key-two', params);
    const encrypted = await encryptJson(k1, { secret: 'data' });
    await expect(decryptJson(k2, encrypted)).rejects.toThrow();
  });

  it('encryptBytes / decryptBytes roundtrip', async () => {
    const params = newKdfParams();
    const key = await deriveAesKeyFromPin('bytes-test', params);
    const original = new Uint8Array([1, 2, 3, 255, 0, 128]);
    const enc = await encryptBytes(key, original);
    const dec = await decryptBytes(key, enc);
    expect(Array.from(dec)).toEqual(Array.from(original));
  });
});
