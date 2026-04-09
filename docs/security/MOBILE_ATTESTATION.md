# Mobile attestation (Android + iOS)

This repo includes a **server-side** challenge/verify contract for mobile app attestation:
- `POST /api/attestation/challenge`
- `POST /api/attestation/verify`

## Why
Client code can be modified/repackaged. Attestation is used to gate **sensitive backend actions** so that only legitimate, properly signed app instances can access production APIs.

## How to use (high level)
1. Mobile app requests a challenge: `POST /api/attestation/challenge`
2. Mobile app calls platform SDK (Play Integrity / App Attest) using the challenge as the **nonce/challenge binding**.
3. Mobile app sends `{ platform, token, challenge }` to `POST /api/attestation/verify`
4. Backend verifies and issues/refreshes a session or attaches an `attestationLevel` to the session.\n+\n+## Configuration\n+Challenge signing (required):\n+- `ATTESTATION_CHALLENGE_HMAC_SECRET`\n+\n+Android (Play Integrity) (required for real verification):\n+- `PLAY_INTEGRITY_SERVICE_ACCOUNT_JSON`\n+- `PLAY_INTEGRITY_PACKAGE_NAME`\n+- `PLAY_INTEGRITY_CLOUD_PROJECT_NUMBER`\n+\n+iOS (App Attest) (required for real verification):\n+- `APP_ATTEST_TEAM_ID`\n+- `APP_ATTEST_BUNDLE_ID`\n+\n+## Status\n+The endpoints are wired and validate server-issued challenges, but **platform token verification is intentionally left unimplemented** until you provide credentials and a concrete policy (device integrity levels, allowed signing, rollout rules).\n+
