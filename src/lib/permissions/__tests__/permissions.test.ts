import { describe, it, expect } from 'vitest';
import { defaultPermissions } from '@/lib/storage';

describe('vault permissions', () => {
  it('admin gets full permissions', () => {
    const p = defaultPermissions('admin');
    expect(p.canExport).toBe(true);
    expect(p.canShare).toBe(true);
    expect(p.role).toBe('admin');
  });

  it('viewer cannot export or share', () => {
    const p = defaultPermissions('viewer');
    expect(p.canExport).toBe(false);
    expect(p.canShare).toBe(false);
  });

  it('member can export but restrictions apply at document level', () => {
    const p = defaultPermissions('member');
    expect(p.role).toBe('member');
    expect(p.canExport).toBe(true);
  });
});
