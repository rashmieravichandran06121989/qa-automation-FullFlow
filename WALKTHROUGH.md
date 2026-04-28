# Walkthrough

A guided tour for reviewers. The [README](README.md) is the map; this is the 10-minute verification path with the design rationale baked in.

---

## What this is

A 45-day Senior-QA → Quality-Architect upskill, delivered as a single repo with four phases stitched together by one master CI pipeline. Every phase is independently runnable locally; every phase is gated in CI; nothing merges to `main` if any phase is red.

---

## Verify it yourself in ~10 minutes

### Prereqs

Node 20+, Docker, [k6 0.54](https://grafana.com/docs/k6/latest/), and (optional) an Applitools API key.

### Phase 1 — AI-assisted UI + API testing

```bash
cd phase-1-ai-testing
npm ci
npx playwright install --with-deps chromium
npm test
```

Runs the BDD suite against SauceDemo + OrangeHRM, plus a REST suite against jsonplaceholder. `@flaky` and `@visual` scenarios are skipped in the default run; enable visual diffs by setting `APPLITOOLS_API_KEY` and dropping `@visual` from the grep filter.

### Phase 2 — Consumer-driven contract testing

```bash
docker compose up -d --wait               # Pact Broker + Postgres
cd phase-2-contract-testing/consumer && npm ci && npm test && npm run publish:pacts
cd ../provider                          && npm ci && npm test
```

Consumer publishes a pact to the broker; provider verifies against it; `can-i-deploy` is the deployment gate.

### Phase 3 — k6 performance suite

```bash
cd phase-3-performance
npm ci
npm run test:foundations
npm run test:load
```

The `npm run k6` wrapper passes `--compatibility-mode=experimental_enhanced` so k6 parses the TypeScript scenarios natively.

---

## What's in each phase (1 paragraph each)

**Phase 1 (`phase-1-ai-testing/`).** Eight Gherkin features driving nine Page Objects through `playwright-bdd`, plus a Zod-validated REST suite and a GraphQL introspection test against `countries.trevorblades.com`. Applitools Ultrafast Grid handles the visual diffs DOM assertions miss — exactly what `problem_user` on SauceDemo is built to break. OrangeHRM login is cached via `globalSetup` + `storageState`, dropping per-scenario login from ~20s to ~4s. Axe-core runs accessibility checks behind the `@a11y` tag.

**Phase 2 (`phase-2-contract-testing/`).** Production-shape Pact setup, not a tutorial. Real broker (Postgres-backed) so the integration is end-to-end. Provider verification authenticates via either token or basic-auth depending on which env vars are present (`pact/providerVerification.test.js`) — that conditional matters because the verifier rejects `undefined` for `pactBrokerToken`. CI runs the broker as a service container so the same flow that works locally works in CI without configuration drift.

**Phase 3 (`phase-3-performance/`).** A k6 framework, not a script. Multi-environment registry (`K6_ENV=staging` switches every test), per-flow Trends with per-endpoint SLAs, and a four-step shopper journey mapped onto stable jsonplaceholder endpoints (the original SauceDemo target was a SPA — its `/inventory.html` etc. routes 404 at the origin because they're JS routes, not files). The `successRate` metric only ticks `true` if every step in an iteration passed — a failed checkout no longer double-counts as both a `businessError` and a success.

**Phase 4 (`phase-4-pipeline/` + `.github/workflows/`).** No new test code — the deliverable is the orchestration. Master pipeline runs `quality` (matrix lint + typecheck) → `ai-testing` + `contract` (parallel) → `performance` (gated on the previous two). Hermetic broker via service containers. ZAP baseline lives in its own reusable workflow so it can be triggered on a schedule without bloating PR feedback time.

---

## CI proof

The [Master Quality Gate workflow](.github/workflows/master-pipeline.yml) runs on every push and PR to `main`. Latest green run lives on the [Actions tab](https://github.com/rashmieravichandran06121989/qa-automation-FullFlow/actions/workflows/master-pipeline.yml).

Run shape:

```
quality (matrix: 4 phases) → ai-testing → contract → performance
```

Total wall-clock: ~7 minutes on `ubuntu-latest`.

---

## Design decisions worth calling out

**1. Visual regression is gated behind a secret, not skipped.**
`APPLITOOLS_API_KEY` is optional. Without it, the suite skips `@visual` scenarios and stays green; with it, those scenarios run and gate the merge. This means a fork without the secret can still validate the bulk of the suite, while the canonical pipeline keeps visual coverage. Implementation: `--grep-invert '@flaky|@visual'` in the default `npm test` script.

**2. The Pact broker is hermetic in CI, persistent locally.**
CI spins up `pactfoundation/pact-broker:latest` as a service container per run, so there's no shared state between PRs and no broker-flake to debug. Locally, the same broker runs from `docker-compose.yml` and persists across sessions for can-i-deploy queries against historical versions. Same provider verification code drives both.

**3. k6 needs `--compatibility-mode=experimental_enhanced` for `.ts` files.**
k6 0.54's TypeScript support is opt-in. The `npm run k6` script in `phase-3-performance/package.json` wraps the flag so contributors don't have to remember it; the master pipeline passes it explicitly. Without it, k6 chokes on `: Options` type annotations at parse time.

---

## Reading order for the rest

After this walkthrough, in order of decreasing usefulness for a reviewer:

1. [`README.md`](README.md) — the map: stack, architecture diagram, quickstart variants.
2. [`docs/adr/`](docs/adr/) — `can-i-deploy` as hard gate. The architectural opinion I'd defend hardest.
3. [`.github/workflows/master-pipeline.yml`](.github/workflows/master-pipeline.yml) — the source of truth for what "green" means.
4. Whichever phase README catches your eye — each is self-contained.
