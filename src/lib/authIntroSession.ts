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

/** True when the user already created a vault PIN — skip marketing intro and show unlock. */
export function shouldShowAuthIntro(hasCredentials: boolean): boolean {
  if (hasCredentials) return false;
  return !isAuthIntroSessionComplete();
}
