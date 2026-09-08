const LOGO_SPLASH_SEEN_KEY = 'strongvault_logo_splash_seen_v7';

export function hasSeenLogoSplash(): boolean {
  try {
    return localStorage.getItem(LOGO_SPLASH_SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

export function markLogoSplashSeen(): void {
  try {
    localStorage.setItem(LOGO_SPLASH_SEEN_KEY, '1');
  } catch {
    /* ignore */
  }
}
