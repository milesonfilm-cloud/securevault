/** Session-only demo / try-before-passcode mode. Never writes to the encrypted vault. */

export const DEMO_MODE_KEY = 'sv_demo_mode';
export const DEMO_VAULT_KEY = 'sv_demo_vault_v1';

export function isDemoMode(): boolean {
  try {
    return sessionStorage.getItem(DEMO_MODE_KEY) === '1';
  } catch {
    return false;
  }
}

export function enterDemoMode(): void {
  try {
    sessionStorage.setItem(DEMO_MODE_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function exitDemoMode(): void {
  try {
    sessionStorage.removeItem(DEMO_MODE_KEY);
    sessionStorage.removeItem(DEMO_VAULT_KEY);
  } catch {
    /* ignore */
  }
}

export function clearDemoVaultStorage(): void {
  try {
    sessionStorage.removeItem(DEMO_VAULT_KEY);
  } catch {
    /* ignore */
  }
}
