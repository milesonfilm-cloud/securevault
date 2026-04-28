import type { CapacitorConfig } from '@capacitor/cli';

/**
 * `webDir` is copied into the native shell. For Next.js, either:
 * - set `output: 'export'` and copy the export folder to `www`, then `npm run cap:sync`, or
 * - point `server.url` at a running dev server (see Capacitor live reload docs).
 */
const config: CapacitorConfig = {
  appId: 'com.securevault.app',
  appName: 'SecureVault',
  webDir: 'www',
};

export default config;
