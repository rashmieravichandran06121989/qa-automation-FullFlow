# Security Policy

## Reporting a vulnerability

If you find a security issue in this portfolio (the test framework itself,
not the demo SUTs it points at), please email **rashmie.yuvaraj@arrive.com**
with:

- A description of the issue and the impact you observed.
- The minimum reproduction (a failing test, a curl command, or a 1-line
  description if the issue is config-shaped).
- Whether you'd like to be credited.

I aim to acknowledge within 72 hours. **Do not open a public issue for
suspected vulnerabilities.**

## What this repo does to keep itself clean

- **SAST on every PR.** CodeQL (security-extended), Trivy (filesystem +
  image), gitleaks, Hadolint, and `npm audit --audit-level=high` block any
  PR that introduces a HIGH/CRITICAL finding. See
  `.github/workflows/master-pipeline.yml`.
- **OWASP ZAP baseline.** Runs on every push to main and weekly via cron;
  findings stream to GitHub Code Scanning as SARIF. See
  `.github/workflows/zap-baseline.yml`.
- **Pinned base images.** Every Dockerfile uses a pinned tag; root
  `docker-compose.yml` pins every service.
- **Secrets via env / GitHub secrets.** `.env` is gitignored;
  `.env.example` is the contract. The `can-i-deploy` step refuses to run
  with default broker credentials (see `master-pipeline.yml` "Guard" step).
- **SBOMs on release.** Tag-only `sbom` job emits SPDX + CycloneDX and
  attaches them to the release artefacts.
- **OIDC-ready.** Workflows declare `id-token: write` so the team can swap
  static cloud credentials for OIDC federation when this lands in an org.

## What this repo deliberately *doesn't* do

- **No active ZAP scanning.** Baseline only — no fuzzing or active payloads.
  Active scans against third-party demo targets (SauceDemo, OrangeHRM,
  jsonplaceholder) would be an abuse of those services.
- **No production credentials anywhere.** Even the demo `secret_sauce`
  password for SauceDemo is sourced via env, not literal — see
  `phase-1-ai-testing/config/credentials.ts`.
