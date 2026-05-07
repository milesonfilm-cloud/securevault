# SecureVault

A **zero-knowledge family document vault** built for India and beyond.

All documents are encrypted client-side with AES-256-GCM before storage.
The server never sees your vault key or your documents.

## Architecture

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Storage**: IndexedDB (primary, offline-first) with optional encrypted Google Drive backup
- **Encryption**: Argon2id (OWASP-recommended KDF) to AES-256-GCM with per-operation random IVs
- **Auth**: WebAuthn (FIDO2) biometrics + PIN. Biometric proves presence; encryption key derived from PIN only.
- **Backend**: Supabase (user auth), Firebase (hosting), Next.js API routes (AI scan proxy, sharing, DigiLocker OAuth)
- **AI**: Claude Sonnet (Anthropic) for OCR field extraction. Only OCR text is sent — no images, no document data.
- **Offline**: Service worker + IndexedDB. Works fully without internet after first load.
- **Mobile**: PWA installable on any device; Android TWA on Play Store.

## Threat model summary

See [docs/security/THREAT_MODEL.md](docs/security/THREAT_MODEL.md) for the full model.
Short version: we assume the client can be compromised. All sensitive operations are
zero-knowledge — the server enforces rate limits and auth but cannot decrypt your vault.

## Setup

### Prerequisites
- Node.js >= 20.9.0
- A Supabase project (enable **anonymous sign-ins** so AI API routes receive a JWT after in-app bootstrap)
- (Optional) Anthropic API key for AI scan
- (Optional) DigiLocker partner credentials for DigiLocker import
- (Optional) Upstash Redis for distributed rate limits (otherwise in-memory per server instance)

### Install and run
```bash
cp .env.example .env
npm install
npm run dev
```

### Production build
```bash
npm run build
npm run start
```

### After clone — signing keys
Do not commit Android keystore or release artifacts. If any were ever tracked:

```bash
git rm --cached my-pwa/android.keystore 2>nul || exit 0
git rm --cached my-pwa/app-release-signed.apk 2>nul || exit 0
git rm --cached my-pwa/app-release-bundle.aab 2>nul || exit 0
```

### Tests
```bash
npm test
npm run test:coverage
npm run test:e2e
```

## Localization

Supported languages: English, Hindi, Tamil, Telugu, Kannada, Malayalam.

To add a language: copy `messages/en.json`, translate all values, save as `messages/{locale}.json`,
and add the locale to the `locales` array in `src/i18n/routing.ts`.

## Security reporting

See [SECURITY.md](SECURITY.md). Do not open public issues for vulnerabilities.

## License

Proprietary. All rights reserved.
