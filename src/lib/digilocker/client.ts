import { SESSION_TOKEN_AT_KEY, SESSION_TOKEN_KEY } from '@/lib/digilocker/constants';

/** One row from Get List of Issued Documents (DigiLocker JSON). */
export type DigiLockerIssuedItem = {
  name: string;
  type: string;
  size?: string;
  date?: string;
  parent?: string;
  mime?: string | unknown;
  uri: string;
  doctype: string;
  description: string;
  issuerid: string;
  issuer: string;
};

type IssuedListResponse = {
  items?: DigiLockerIssuedItem[];
};

export class DigiLockerClient {
  constructor(
    private accessToken: string,
    private options?: {
      /** Same-origin proxy default. */
      issuedPath?: string;
      fileProxyPath?: string;
    }
  ) {}

  async getIssuedDocuments(): Promise<DigiLockerIssuedItem[]> {
    const path = this.options?.issuedPath ?? '/api/digilocker/proxy/issued';
    const res = await fetch(path, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'application/json',
      },
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      throw new Error(`digilocker_issued_failed:${res.status}:${t.slice(0, 200)}`);
    }
    const json = (await res.json()) as IssuedListResponse;
    return Array.isArray(json.items) ? json.items : [];
  }

  /** Download raw file (PDF/XML) for a document `uri` from issued list. */
  async downloadDocument(uri: string): Promise<ArrayBuffer> {
    const base = this.options?.fileProxyPath ?? '/api/digilocker/proxy/file';
    const res = await fetch(`${base}?uri=${encodeURIComponent(uri.trim())}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      throw new Error(`digilocker_file_failed:${res.status}:${t.slice(0, 120)}`);
    }
    return res.arrayBuffer();
  }

  static getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return sessionStorage.getItem(SESSION_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  static clearStoredToken(): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(SESSION_TOKEN_KEY);
      sessionStorage.removeItem(SESSION_TOKEN_AT_KEY);
    } catch {
      /* ignore */
    }
  }
}
