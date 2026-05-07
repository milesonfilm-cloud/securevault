import type { CapacitorConfig } from '@capacitor/cli';

/**
 * `webDir` is copied into the native shell. For this Next.js app (API routes, SSR):
 * - **Recommended:** set `CAP_SERVER_URL` to your **HTTPS** production URL, run `npm run cap:sync`,
 *   then build the APK/AAB in Android Studio (or `android/gradlew assembleDebug`).
 * - **Local dev on device:** `CAP_SERVER_URL=http://YOUR_LAN_IP:4028` (HTTP → `cleartext: true`;
 *   you may need a network-security config for production use of HTTP).
 * - **Pure offline bundle:** only if you add `output: 'export'` and a static-compatible build,
 *   then copy the export into `www/`.
 */
const serverUrl = process.env.CAP_SERVER_URL?.trim();

const config: CapacitorConfig = {
  appId: 'com.securevault.app',
  appName: 'SecureVault',
  webDir: 'www',
  ...(serverUrl
    ? {
        server: {
          url: serverUrl.replace(/\/$/, ''),
          cleartext: serverUrl.startsWith('http://'),
        },
      }
    : {}),
};

export default config;
