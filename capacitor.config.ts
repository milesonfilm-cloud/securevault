import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Strong Vault ships as Android + iOS only. The UI is a static Next export in `www/`
 * (run `npm run build:mobile`).
 *
 * By default this is local-only: it will NOT load any remote server URL.
 * If you explicitly want remote dev loading, set `CAP_ALLOW_REMOTE=1` and `CAP_SERVER_URL`.
 *
 * IMPORTANT (Android): Capacitor html5mode serves root `index.html` for any path
 * whose last segment has no ".". A root file that redirects to `/en/.../` therefore
 * infinite-loops. Always start at a real `*.html` asset.
 */
const serverUrl = process.env.CAP_SERVER_URL?.trim();
const allowRemote = process.env.CAP_ALLOW_REMOTE === '1';

const localServer = {
  /** Real file (has `.html`) so Android does not SPA-fallback to root index. */
  appStartPath: '/en/family-management/index.html',
  androidScheme: 'https' as const,
};

const config: CapacitorConfig = {
  appId: 'strongvault.com',
  appName: 'Strong Vault',
  webDir: 'www',
  android: {
    allowMixedContent: false,
    /** Chrome://inspect WebView debugging while diagnosing blank screens. */
    webContentsDebuggingEnabled: true,
  },
  ios: {
    contentInset: 'automatic',
  },
  server: {
    ...localServer,
    ...(serverUrl && allowRemote
      ? {
          url: serverUrl.replace(/\/$/, ''),
          cleartext: serverUrl.startsWith('http://'),
        }
      : {}),
  },
};

export default config;
