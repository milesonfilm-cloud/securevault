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
  'Set NEXT_PUBLIC_GOOGLE_CLIENT_ID or GOOGLE_OAUTH_CLIENT_ID in the environment before running production build, then redeploy (see .env.example). CI: add one of these as a repository secret. Web and mobile shell share the same bundle — it is not configured on each device.';
