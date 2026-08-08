import type { CapacitorConfig } from '@capacitor/cli';

/**
 * SecureVault ships as Android + iOS only. The UI is a static Next export in `www/`
 * (run `npm run build:mobile`).
 *
 * By default this is local-only: it will NOT load any remote server URL.
 * If you explicitly want remote dev loading, set `CAP_ALLOW_REMOTE=1` and `CAP_SERVER_URL`.
 */
const serverUrl = process.env.CAP_SERVER_URL?.trim();
const allowRemote = process.env.CAP_ALLOW_REMOTE === '1';

const config: CapacitorConfig = {
  appId: 'com.securevault.app',
  appName: 'SecureVault',
  webDir: 'www',
  android: {
    allowMixedContent: false,
  },
  ios: {
    contentInset: 'automatic',
    scheme: 'SecureVault',
  },
  plugins: {
    CapacitorShareTarget: {
      /** Must match App Group on App + ShareExtension entitlements */
      appGroupId: 'group.com.securevault.app',
    },
  },
  ...(serverUrl && allowRemote
    ? {
        server: {
          url: serverUrl.replace(/\/$/, ''),
          cleartext: serverUrl.startsWith('http://'),
        },
      }
    : {}),
};

export default config;
