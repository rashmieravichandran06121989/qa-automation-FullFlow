# Phase 4 — CI/CD Ownership + Docker + Security

The phase that ties Phases 1–3 together. Every artefact below lives at the
**root** of this repo because Phase 4's deliverable is the master pipeline
itself, not yet another sub-suite.

| Day | Deliverable | Where it lives |
|-----|-------------|----------------|
| 35–36 | Containerise every test runner | `phase-1-ai-testing/Dockerfile` · `phase-3-performance/Dockerfile` |
| 35–36 | Single bring-up of all backing services | `../docker-compose.yml` (root) |
| 37–38 | Master CI pipeline | `../.github/workflows/master-pipeline.yml` |
| 39–40 | OWASP ZAP baseline | `../.github/workflows/zap-baseline.yml` · `../.github/zap/rules.tsv` |
| 41–42 | Combined portfolio repo | this repo |

## What the pipeline proves

Six gates, in this order, blocking on the first red:

```
quality → ai-testing → contract → performance → security → summary
```

- **quality** — lint + typecheck on all four sub-packages, parallel matrix.
- **ai-testing** — Phase 1 Playwright + BDD + Applitools (visual checks skipped if `APPLITOOLS_API_KEY` is absent).
- **contract** — Phase 2 consumer publish → provider verify → `can-i-deploy` against an ephemeral Pact Broker (services-block, no compose).
- **performance** — Phase 3 k6 foundations + load, threshold-gated (p95, error-rate).
- **security** — Phase 4 ZAP baseline, SARIF uploaded to GitHub Code Scanning.
- **summary** — markdown step-summary aggregating every stage's result.

## Local equivalent

Everything the CI does, you can do locally:

```bash
docker compose up -d                                          # broker + Influx + Grafana
(cd phase-1-ai-testing      && npm test)                       # Phase 1
(cd phase-2-contract-testing/consumer && npm test)             # Phase 2 consumer
(cd phase-2-contract-testing/provider && npm run pact:verify)  # Phase 2 provider
(cd phase-3-performance     && k6 run tests/load/load-test.ts) # Phase 3
docker run --rm ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py -t https://jsonplaceholder.typicode.com      # Phase 4 ZAP
```

## Design choices that matter in interviews

1. **Reusable workflow for ZAP** — `workflow_call` from the master, `workflow_dispatch` for ad-hoc, `schedule` for weekly drift. One file, three invocation paths.
2. **Pact Broker as a service container** — no docker-compose needed in CI; the runner gets a fresh broker per workflow, so contract test runs are hermetic.
3. **k6 thresholds are CI gates, not dashboards** — `--summary-export` plus per-endpoint tagging means a regression fails the pipeline, it doesn't just look ugly on Grafana.
4. **ZAP rules file** — every IGNORE in `.github/zap/rules.tsv` is a tracked, dated decision, not a silent suppression.
5. **Concurrency groups** — `master-${{ github.ref }}` and `zap-${{ github.ref }}` cancel in-flight runs on the same branch so a fast-follow push doesn't pile up.

## Pitfalls already avoided

- **No `:latest` tags** — every image in `docker-compose.yml` is pinned.
- **All ports loopback-bound** — `127.0.0.1:9292` not `:9292`.
- **`.env` never committed** — `.env.example` is the contract.
- **Healthchecks on every service** — `docker compose up --wait` is reliable.
- **Non-root containers** — Playwright's `pwuser`, k6's bundled k6 user.

See `../docs/study-guides/phase-4-cicd-docker-security-study-guide.docx` for the line-by-line walk-through that produced these decisions.
