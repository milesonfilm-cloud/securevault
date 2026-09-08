const APP_WALKTHROUGH_SEEN_KEY = 'strongvault_app_walkthrough_seen_v2';
const APP_WALKTHROUGH_PENDING_KEY = 'sv_walkthrough_pending_v2';

export type WalkthroughStepId =
  | 'welcome'
  | 'family'
  | 'add-member'
  | 'add-document'
  | 'search'
  | 'documents'
  | 'menu';

export function hasSeenAppWalkthrough(): boolean {
  try {
    return localStorage.getItem(APP_WALKTHROUGH_SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

export function markAppWalkthroughSeen(): void {
  try {
    localStorage.setItem(APP_WALKTHROUGH_SEEN_KEY, '1');
    sessionStorage.removeItem(APP_WALKTHROUGH_PENDING_KEY);
  } catch {
    /* ignore */
  }
}

export function clearAppWalkthroughSeen(): void {
  try {
    localStorage.removeItem(APP_WALKTHROUGH_SEEN_KEY);
    sessionStorage.removeItem(APP_WALKTHROUGH_PENDING_KEY);
  } catch {
    /* ignore */
  }
}

/** Call after the user creates a vault PIN so the in-app tour runs on first unlock. */
export function requestFirstSignInWalkthrough(): void {
  try {
    localStorage.removeItem(APP_WALKTHROUGH_SEEN_KEY);
    sessionStorage.setItem(APP_WALKTHROUGH_PENDING_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function isWalkthroughPending(): boolean {
  try {
    return sessionStorage.getItem(APP_WALKTHROUGH_PENDING_KEY) === '1';
  } catch {
    return false;
  }
}
