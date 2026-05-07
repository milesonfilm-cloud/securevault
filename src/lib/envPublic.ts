/**
 * Build-time public config (NEXT_PUBLIC_* is inlined when `next build` runs).
 *
 * Web, PWA, and in-app WebView all load the **same** JS bundle — OAuth client IDs are
 * not read from the phone. Set variables in `.env` / CI before building; redeploy to update.
 */

export function hasGoogleOAuthClientId(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim());
}

/** Shown when Drive backup UI is visible but OAuth was not configured at build time. */
export const GOOGLE_DRIVE_BACKUP_SETUP_BLURB =
  'Drive backup needs a Google OAuth client ID in the project environment before the app is built (see .env.example). Rebuild and redeploy — the app and mobile shell use the same bundle, so this is not set per device.';
