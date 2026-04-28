# syntax=docker/dockerfile:1.7
#
# Phase 1 — AI-Assisted Testing Suite
# Containerises the Playwright + playwright-bdd + Applitools suite.
#
# Build:  docker build -t qa-phase1:local .
# Run:    docker run --rm \
#           -e APPLITOOLS_API_KEY=$APPLITOOLS_API_KEY \
#           -v "$PWD/playwright-report:/work/playwright-report" \
#           -v "$PWD/allure-results:/work/allure-results" \
#           qa-phase1:local
#
# Multi-stage rationale:
#   - Stage 1 (deps)   resolves npm dependencies once. Cached on package*.json hash.
#   - Stage 2 (runner) carries only what's needed at test time + the browser runtime.
# The browser runtime comes from mcr.microsoft.com/playwright so version drift
# between Playwright and the bundled browsers is impossible.

ARG NODE_VERSION=20
ARG PLAYWRIGHT_VERSION=1.46.0

# ---- Stage 1: deps ---------------------------------------------------------
FROM mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-jammy AS deps

WORKDIR /work

# Lockfile + manifest first so the install layer caches independently of source changes.
# `npm ci` is deterministic — fails on lockfile drift.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ---- Stage 2: runner -------------------------------------------------------
FROM mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-jammy AS runner

# Non-root user — the upstream image creates `pwuser` (uid 1000).
WORKDIR /work
ENV CI=1 \
    NODE_ENV=test \
    PLAYWRIGHT_HTML_REPORT=playwright-report

COPY --from=deps --chown=pwuser:pwuser /work/node_modules ./node_modules

# Source — matches the actual tree of phase-1-ai-testing/.
COPY --chown=pwuser:pwuser features/             ./features/
COPY --chown=pwuser:pwuser steps/                ./steps/
COPY --chown=pwuser:pwuser pages/                ./pages/
COPY --chown=pwuser:pwuser tests/                ./tests/
COPY --chown=pwuser:pwuser fixtures/             ./fixtures/
COPY --chown=pwuser:pwuser config/               ./config/
COPY --chown=pwuser:pwuser playwright.config.ts  ./
COPY --chown=pwuser:pwuser applitools.config.ts  ./
COPY --chown=pwuser:pwuser tsconfig.json         ./
COPY --chown=pwuser:pwuser package.json          ./

USER pwuser

# Default: run the BDD suite (skips @flaky scenarios). Override at runtime to
# target a single scenario or to invoke the API project instead.
CMD ["npm", "test", "--silent"]
