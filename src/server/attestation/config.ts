import 'server-only';

export function getAttestationConfig() {
  const challengeSecret = process.env.ATTESTATION_CHALLENGE_HMAC_SECRET || '';

  return {
    challengeSecret,
    android: {
      /**
       * Optional: package name to bind verification.
       * Example: com.yourcompany.securevault
       */
      packageName: process.env.PLAY_INTEGRITY_PACKAGE_NAME || '',
      /**
       * Optional: Google Cloud project number/id.
       */
      cloudProjectNumber: process.env.PLAY_INTEGRITY_CLOUD_PROJECT_NUMBER || '',
      /**
       * Optional: Service account JSON for OAuth token exchange.
       * If unset, verification runs in "not configured" mode.
       */
      serviceAccountJson: process.env.PLAY_INTEGRITY_SERVICE_ACCOUNT_JSON || '',
    },
    ios: {
      /**
       * Optional: Apple team/app identifiers used during verification.
       * If unset, verification runs in "not configured" mode.
       */
      teamId: process.env.APP_ATTEST_TEAM_ID || '',
      bundleId: process.env.APP_ATTEST_BUNDLE_ID || '',
      /**
       * Optional: Apple key/cert material for verification if you implement it.
       */
      keyId: process.env.APP_ATTEST_KEY_ID || '',
      privateKeyPem: process.env.APP_ATTEST_PRIVATE_KEY_PEM || '',
    },
  };
}
