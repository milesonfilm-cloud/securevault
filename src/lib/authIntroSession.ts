/** Session flag: user finished marketing intro (landing +/or in-app cards). Skips duplicate onboarding in AuthGuard. */
export const AUTH_INTRO_SESSION_KEY = 'sv_auth_intro';

export function completeAuthIntroSession(): void {
  try {
    sessionStorage.setItem(AUTH_INTRO_SESSION_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function isAuthIntroSessionComplete(): boolean {
  try {
    return sessionStorage.getItem(AUTH_INTRO_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}
