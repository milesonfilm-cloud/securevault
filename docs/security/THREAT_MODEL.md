# Threat Model (SecureVault)

This document defines what we’re protecting, realistic attacker capabilities, and **measurable acceptance criteria** for: anti-tamper/anti-replacement, anti-copy, and supply-chain hardening.

## Assets
- **User data**: documents, metadata, user identifiers.
- **Authentication**: session tokens, refresh tokens, OAuth tokens (if any).
- **Encryption materials**: any keys derived/stored client-side, server-side KMS keys.
- **Backend integrity**: API endpoints and authorization decisions.
- **Build integrity**: CI pipeline, dependencies, release artifacts.

## Trust boundaries
- **Mobile device** (untrusted): end-user controlled; may be rooted/jailbroken; app can be repackaged.
- **Network** (untrusted): MITM possible on hostile networks.
- **Backend** (trusted): must enforce authz, input validation, and anti-abuse.
- **CI/CD** (trusted): produces signed artifacts; should be isolated and auditable.

## Threats by goal

### 1) Anti-tamper / anti-replacement
**Threats**
- Repackaged app (modified JS/assets/native code) distributed to users.
- Hooking/debugging to bypass client checks.
- Runtime patching or instrumentation on rooted/jailbroken devices.

**Controls (industry-standard)**
- **Platform signing**: Android (keystore), iOS (App Store / enterprise signing).
- **Runtime attestation**: Play Integrity (Android), App Attest/DeviceCheck (iOS).
- **Server-side enforcement**: gate high-risk endpoints on attestation; detect replay.
- Defense-in-depth: root/jailbreak detection, debugger/emulator signals (risk-based), integrity signals collection.

**Acceptance criteria**
- Production APIs that access/modify sensitive user data **require** a valid attestation token bound to the session/user.
- Attestation verification is enforced **server-side** (not client-side only).
- Repackaged app without proper signing/attestation **cannot** perform sensitive operations in production.
- Attestation tokens are **non-replayable** (nonce + server challenge + short TTL).

### 2) Anti-copy (IP protection)
**Reality check**
If users receive the client bundle, perfect prevention of copying is not achievable. Treat obfuscation as **friction**, not a security boundary.

**Controls**
- Move sensitive logic server-side; keep secrets out of the client.
- Build watermarking/identifiers; license terms; telemetry for abuse detection (privacy-aware).
- Optional: minification/obfuscation for friction.

**Acceptance criteria**
- No production secrets (API keys, private keys) are shipped in the client.
- Sensitive decisions (authorization, rate limits, entitlements) are enforced server-side.

### 3) Supply-chain hardening
**Threats**
- Malicious dependency/version drift; compromised maintainer.
- CI runner compromise; poisoned caches.
- Unsigned/unverifiable releases.

**Controls**
- Lockfile-based installs in CI (`npm ci`).
- Dependency update automation + vulnerability scanning.
- Build from clean environment; reduce privileges; provenance/SBOM where feasible.

**Acceptance criteria**
- CI uses `npm ci` and fails on lockfile mismatch.
- Critical vulnerability policy exists; exceptions require documented approval.
- Release artifacts are built in CI and are traceable to a commit (provenance).

## Out of scope (explicit)
- Stopping a motivated attacker from extracting/replicating the UI.
- Preventing screenshots or offline copying of already-exposed content on a compromised device.

