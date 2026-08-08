# AGENTS.md

## Cursor Cloud specific instructions

SecureVault is a single **client-side** Next.js 15 / React 19 / TypeScript app (web + PWA, plus Capacitor Android/iOS wrappers). There is **no backend server, database, cache, or queue** — the vault lives entirely in the browser's IndexedDB and encryption/OCR run client-side. Bringing the product up end-to-end only requires the one Next.js dev server.

### Services

| Service | Command | Port | Notes |
|---|---|---|---|
| Next.js dev server (the whole app) | `npm run dev` | 4028 | The port is hardcoded in the `dev`/`start`/`serve` scripts and `playwright.config.ts`. Root `/` redirects to `/en/family-management`. |

Standard commands (already defined in `package.json` `scripts`, don't duplicate elsewhere): `npm run type-check`, `npm run lint`, `npm test` (Vitest unit), `npm run test:coverage`, `npm run test:e2e` (Playwright), `npm run build`, `npm run start`.

### Non-obvious notes

- **Node**: `engines` requires Node `>=20.9.0`; the VM's default Node satisfies this. If a version manager (mise/fnm) shadows it, disable it so a `>=20.9.0` node is used.
- **`.env`**: an app `.env` already exists in the repo. All external integrations (Supabase, Google Drive, DigiLocker, Stripe, AI providers, Upstash) are **optional** and self-disable when their keys are absent — no secrets are needed to run or test the core vault.
- **`postinstall`** runs `scripts/patch-capgo-share-target.mjs`, which patches an iOS Capacitor plugin in `node_modules`; it skips gracefully when targets are missing. This runs automatically on every `npm install`.
- **Lint is pre-existing-dirty**: `npm run lint` currently reports several `prettier/prettier` formatting errors and a couple of lint warnings in committed source. These are pre-existing (not environment issues); the lint tooling itself works. Do not mass-reformat unrelated files just to make lint pass.
- **Playwright e2e**: requires browser binaries first (`npx playwright install --with-deps chromium`). `test:e2e` auto-starts the dev server on 4028 (reusing an existing one unless `CI` is set), so you don't need to start it manually.
- **Onboarding for manual testing**: a brand-new user clicks through the intro screens and creates a text vault password (no numeric PIN, no biometric/WebAuthn hardware required — biometric is optional and reports "not available on this device or browser"). After that you land in Family Members / Document Vault. State persists in IndexedDB per browser profile, so re-visits may show a lock screen expecting the previously set password.
- **Mobile builds** (`npm run build:mobile`, `cap:*`) need Android Studio/JDK or Xcode and are **not** required to run or test the web product.
