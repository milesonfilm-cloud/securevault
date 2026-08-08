import { describe, expect, it, beforeEach } from 'vitest';
import {
  GENESIS_HASH,
  __unsafeReplaceAuditEntriesForTests,
  appendAuditEntryAsync,
  clearAuditLog,
  computeEntryHash,
  getAuditLog,
  verifyAuditIntegrity,
  type AuditEntry,
} from '../auditLog';

describe('auditLog hash chain', () => {
  beforeEach(async () => {
    await clearAuditLog();
  });

  it('computes deterministic entry hashes', async () => {
    const base = {
      id: 'a1',
      action: 'document_created' as const,
      actorMemberId: 'm1',
      targetId: 'd1',
      targetTitle: 'PAN',
      categoryId: 'government-ids',
      timestamp: '2026-01-01T00:00:00.000Z',
    };
    const h1 = await computeEntryHash(GENESIS_HASH, base);
    const h2 = await computeEntryHash(GENESIS_HASH, base);
    expect(h1).toBe(h2);
    expect(h1).toHaveLength(64);
  });

  it('verifies an intact chain after appends', async () => {
    await appendAuditEntryAsync({
      action: 'document_created',
      actorMemberId: 'm1',
      targetId: 'd1',
      targetTitle: 'Aadhaar',
      categoryId: 'government-ids',
    });
    await appendAuditEntryAsync({
      action: 'document_viewed',
      actorMemberId: 'm1',
      targetId: 'd1',
      targetTitle: 'Aadhaar',
      categoryId: 'government-ids',
    });
    const result = await verifyAuditIntegrity();
    expect(result.ok).toBe(true);
    expect(result.entryCount).toBeGreaterThanOrEqual(2);

    const newestFirst = await getAuditLog();
    expect(newestFirst[0]?.action).toBe('document_viewed');
  });

  it('detects tampering with an entry hash', async () => {
    await appendAuditEntryAsync({
      action: 'document_created',
      actorMemberId: 'm1',
      targetId: 'd1',
      targetTitle: 'PAN',
      categoryId: 'government-ids',
    });
    const newestFirst = await getAuditLog();
    const chronological = [...newestFirst].reverse();
    const tampered: AuditEntry[] = chronological.map((e, i) =>
      i === chronological.length - 1 ? { ...e, targetTitle: 'TAMPERED', hash: e.hash } : e
    );
    await __unsafeReplaceAuditEntriesForTests(tampered);
    const broken = await verifyAuditIntegrity();
    expect(broken.ok).toBe(false);
    expect(broken.brokenAt).not.toBeNull();
  });
});
