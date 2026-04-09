# Client hardening (mobile-first)

This project’s core security model assumes **clients can be compromised**. Client-side hardening is defense-in-depth and must be paired with **server-side enforcement** (see `docs/security/MOBILE_ATTESTATION.md`).

## 1) Keep secrets out of the client (non-negotiable)
- No API keys, private keys, service account JSON, or long-lived tokens in the app bundle.
- Any “entitlement” decisions must be validated server-side.

## 2) Root/Jailbreak + debugger + emulator signals (risk-based)
Recommended approach for a mobile wrapper (React Native / Capacitor / native shell):
- Collect signals:
  - Root/jailbreak indicators
  - Debugger attached / tamper frameworks
  - Emulator/simulator heuristics
- Use signals to **reduce exposure**:
  - Require re-auth or step-up verification
  - Disable high-risk actions (export, vault unlock, key enrollment)
  - Increase rate-limits and logging on backend\n+\n+Do not rely on these checks alone: they are bypassable.\n+\n+## 3) TLS / certificate pinning (native networking layer)\n+Web apps cannot reliably pin certificates. For mobile distribution, implement pinning in the **native HTTP stack**:\n+- Pin to your API domain’s public key(s) (SPKI pins) with a rotation plan.\n+- Keep at least one backup pin to avoid bricking clients during certificate rotations.\n+- Prefer short-lived sessions and server-side detection for pinning failures.\n+\n+## 4) Secure storage\n+- Use OS-provided secure storage for secrets (Keychain/Keystore).\n+- Avoid storing sensitive values in JS-accessible storage.\n+\n+## 5) Release hardening\n+- Disable debug builds for production.\n+- Turn on platform protections (iOS: hardened runtime defaults; Android: minify/shrink as appropriate).\n+- Use attestation-gated endpoints for sensitive operations.\n+\n+## 6) How this repo supports hardening\n+- `POST /api/attestation/challenge` issues an HMAC-signed challenge.\n+- `POST /api/attestation/session` can mint a short-lived httpOnly cookie after verification.\n+- `GET /api/attested/ping` demonstrates gating using the signed cookie.\n+\n*** End Patch"})}}]}```}}]} in "commentary to=functions.ApplyPatch" with a JSON dict; this is incorrect. Need freeform patch. We'll redo.
