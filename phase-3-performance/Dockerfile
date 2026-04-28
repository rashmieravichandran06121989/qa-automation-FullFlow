# syntax=docker/dockerfile:1.7
# k6 runner image for the performance suite.
#
# Multi-stage build:
#   1. base    — pinned k6 binary, non-root user, minimal Alpine
#   2. test    — adds the suite source so this image can run any test
#
# Build:   docker build -t k6-suite:local .
# Smoke:   docker run --rm k6-suite:local run tests/foundations/foundations-test.ts
# CI run:  docker run --rm -e K6_ENV=staging -e STAGING_BASE_URL=... \
#            -v "$PWD/reports:/work/reports" \
#            k6-suite:local run tests/load/load-test.ts

# ---- Stage 1: base ---------------------------------------------------------
ARG K6_VERSION=0.54.0
FROM grafana/k6:${K6_VERSION} AS base

# grafana/k6 ships as Alpine. Switch to root only to install curl + ca-certs,
# then drop back to the unprivileged k6 user the upstream image already creates.
USER root
RUN apk add --no-cache --update ca-certificates tini \
 && rm -rf /var/cache/apk/*

 # Drop back to the unprivileged k6 user the upstream grafana/k6 image creates.
USER k6


# tini is PID 1 — forwards signals correctly so docker stop terminates k6.
ENTRYPOINT ["/sbin/tini", "--", "k6"]

# ---- Stage 2: test ---------------------------------------------------------
FROM base AS test

# Workdir owned by the k6 user so the runner can write reports/.
WORKDIR /work
RUN mkdir -p /work/reports && chown -R k6:k6 /work

# Copy only what the runner needs at execution time. Excluding node_modules,
# .git, docs, and reports keeps the layer small and the build cache stable
# across cosmetic edits to README/docs.
COPY --chown=k6:k6 tests/   ./tests/
COPY --chown=k6:k6 utils/   ./utils/
COPY --chown=k6:k6 config/  ./config/
COPY --chown=k6:k6 tsconfig.json ./

# Default to the unprivileged user.
USER k6

# Sensible defaults the runner can override at `docker run` time.
ENV K6_ENV=sandbox \
    K6_COMPATIBILITY_MODE=experimental_enhanced \
    K6_OUT="" \
    K6_NO_USAGE_REPORT=true

# Healthcheck verifies the binary is callable. Keeps `docker compose ps` honest
# when this image is wrapped into a long-lived service for ad-hoc runs.
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=2 \
  CMD k6 version || exit 1

# Default command is `k6` (already the entrypoint). Useful default args:
CMD ["version"]
