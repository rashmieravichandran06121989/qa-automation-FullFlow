# ADR-0001 — Polyglot monorepo, not a unified framework

- **Status:** Accepted
- **Date:** 2026-04-28
- **Deciders:** R. Eravichandran (Quality Architect)

## Context

The portfolio assembles four phase deliverables — AI-augmented UI, contract,
performance, and security — into one master repo. A reasonable alternative
would be a single test framework (e.g. Playwright everywhere, with a homegrown
load runner and a homegrown contract checker on top). The framing question is:
**one tool surface, or four idiomatic tool surfaces?**

## Decision

Keep four idiomatic test surfaces. Each phase uses the canonical tool for its
problem class:

| Phase | Tool | Why |
|---|---|---|
| 1 | Playwright + playwright-bdd | Best-in-class browser automation; BDD layer reads as product spec |
| 2 | Pact JS + Jest | Pact's verification model is the canonical idiom for consumer-driven contracts |
| 3 | k6 (Go runtime, JS scenario API) | Single-binary load runner; arrival-rate executor is unmatched |
| 4 | GitHub Actions + OWASP ZAP | Native to where the code lives; ZAP is the OWASP-blessed baseline scanner |

The phases share **one outer shell** (root `.github/`, root `docker-compose.yml`,
root README, one git history) but **zero in-process code**. They communicate
exclusively through artefacts (Pact JSON, k6 summary JSON, SARIF, Allure
results) and target-environment configuration.

## Consequences

### Positive

- Each phase uses the right tool. No "Playwright for load testing" anti-pattern.
- A new contributor can ramp on one phase without learning the others.
- Tools can be upgraded independently; there's no shared dependency lock-in.
- Failures localise — a Pact-broker outage doesn't take down the perf gate.

### Negative (and how we mitigate)

- **Three test-data implementations.** Mitigated by `packages/contracts/` —
  shared TypeScript types describing the upstream API, imported by Phase 1
  (request fixtures) and Phase 3 (k6 data factory). Pact owns the schema source
  of truth in Phase 2.
- **Five report formats.** Mitigated by the master pipeline's PR-comment
  summary aggregating all five into one markdown table. Allure / Pact /
  k6 / SARIF artefacts are uploaded with stable names so a reader can drill in.
- **No cross-phase refactoring tools.** Accepted as a cost. We don't expect
  cross-phase shared code beyond the contracts package; if that grows, revisit
  this ADR.

## Alternatives considered

1. **Single Playwright framework** with a homegrown load runner. *Rejected:*
   k6's arrival-rate executor and InfluxDB integration would have to be
   reimplemented; net effort exceeds the value of single-tool ergonomics.
2. **Separate repos per phase, linked via a portfolio README.** *Rejected:*
   Phase 4 is explicitly the *combination* in the 45-day plan. A portfolio
   README that points at four GitHub URLs doesn't demonstrate ownership of an
   end-to-end pipeline.
3. **Nx / Turborepo monorepo with shared TS config.** *Rejected for now:*
   Phase 2 is JS, Phase 3 mixes TS+esbuild, Phase 1 is TS strict — the cost of
   harmonising tsconfig and ESLint outweighs the benefit. Revisit if a fifth
   phase is added.
