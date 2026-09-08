export type AuditAction =
  | 'document_created'
  | 'document_updated'
  | 'document_deleted'
  | 'document_viewed'
  | 'document_exported'
  | 'member_created'
  | 'member_updated'
  | 'member_deleted'
  | 'vault_unlocked'
  | 'vault_exported'
  | 'emergency_pdf_generated'
  | 'digilocker_connected';

export interface AuditEntry {
  id: string;
  action: AuditAction;
  actorMemberId: string | null;
  targetId: string | null;
  targetTitle: string | null;
  timestamp: string;
  metadata?: Record<string, string>;
}

const AUDIT_KEY = 'sv_audit_log';
const MAX_ENTRIES = 500;

export function getAuditLog(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    return raw ? (JSON.parse(raw) as AuditEntry[]) : [];
  } catch {
    return [];
  }
}

export function appendAuditEntry(entry: Omit<AuditEntry, 'id' | 'timestamp'>) {
  try {
    const log = getAuditLog();
    const newEntry: AuditEntry = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newEntry, ...log].slice(0, MAX_ENTRIES);
    localStorage.setItem(AUDIT_KEY, JSON.stringify(updated));
  } catch {
    /* ignore storage errors */
  }
}

export function clearAuditLog() {
  try {
    localStorage.removeItem(AUDIT_KEY);
  } catch {
    /* ignore */
  }
}
