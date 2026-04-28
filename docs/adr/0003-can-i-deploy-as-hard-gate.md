# ADR-0003 — `can-i-deploy` is a hard gate, never `|| true`

- **Status:** Accepted
- **Date:** 2026-04-28
- **Affects:** `.github/workflows/master-pipeline.yml`, `phase-2-contract-testing/`

## Context

The `can-i-deploy` step in the contract job answers the only question that
matters at deploy time: *"Is the version of the consumer I'm about to ship
compatible with the version of the provider currently in the target
environment?"* The CLI exits non-zero if the answer is no.

An earlier draft of the master pipeline ended this step with `|| true`. That
turned the gate into a no-op: `can-i-deploy` would print "incompatible" and
the workflow would continue happily.

## Decision

The `can-i-deploy` step **must** propagate its exit code. No `|| true`. No
`continue-on-error: true`. If a consumer/provider pair can't safely deploy
together, the master pipeline fails, hard.

## Why

A non-blocking safety gate is *worse* than no gate. It teaches the team that
the gate doesn't matter ("it always shows red, ignore it") and accumulates
unverified deployments.

## Consequences

- Provider verifications must run on every push to main, otherwise the
  consumer's `can-i-deploy` will block waiting for a fresh verification.
- The CI workflow includes a `record-deployment` step on push to main, so the
  broker's deployment matrix reflects what's actually live. Without this,
  every `can-i-deploy` would compare against stale "deployed-to-production"
  flags.
- Feature-branch consumer pacts publish with `--branch` so they don't
  contaminate the main matrix.
- We use `--provider-version-branch main` on `can-i-deploy` so a provider's
  feature branch doesn't accidentally block a consumer's main deploy.

## Escape hatch

If a known-incompatible deployment is intentional (e.g., coordinating a
breaking change across a release window), the team must publish a
`--ignore` argument with a Jira ticket reference, and the change requires a
two-person review per CODEOWNERS. That's `can-i-deploy --ignore-pacticipant
order-service:abc123` — not `|| true`.
