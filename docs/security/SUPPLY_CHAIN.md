# Supply-chain hardening

## Baseline policy
- **CI installs must use `npm ci`** (lockfile required).
- Lockfile changes are reviewed like code changes.
- **Critical vulnerabilities** must be fixed or explicitly accepted with documented justification.

## Automated controls in this repo
- **Dependabot**: weekly grouped updates in [`.github/dependabot.yml`](C:/dev/SECUREVAULT/.github/dependabot.yml).
- **CI quality gates**: [`.github/workflows/ci.yml`](C:/dev/SECUREVAULT/.github/workflows/ci.yml) runs format/lint/typecheck/build.
- **Weekly audit report**: [`.github/workflows/dependency-audit.yml`](C:/dev/SECUREVAULT/.github/workflows/dependency-audit.yml) emits an `npm audit` JSON report.\n+\n+## Recommended next steps (when you have a release process)\n+- **Provenance**: build artifacts in CI only; store build metadata (commit SHA, build number).\n+- **SBOM**: generate and attach an SBOM to releases.\n+- **Signing**: sign release artifacts (mobile signing is mandatory; for web/server artifacts consider signing where applicable).\n+- **Least privilege**: lock down CI permissions and secrets.\n+
