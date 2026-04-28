# Phase 2 — Contract testing runbook

The audit (Part 1) flagged: "no docs on what happens when the consumer
needs a new field, who owns rollback, broker outage handling, multi-consumer
scale." This runbook is that contract.

## 1. Day-to-day flow

```
                   feature branch                          main
consumer  ──── consumer-pact ──── publish (branch=feat/x) ──┐
                                                            │
                                                            ▼
                                                      Pact Broker
                                                            │
                                                            ▼
provider ──── webhook ────────── verify (consumer=feat/x) ──┘
```

- A consumer feature branch publishes its pact with `--branch=<head_ref>`
  and `--consumer-app-version=<sha>`.
- The Pact Broker fires a webhook (see *§5*) at the provider's CI, which
  verifies the new pact against the running provider and publishes the
  verification result back.
- A green provider verification means `can-i-deploy --to=production` for the
  consumer's main branch will return success when the consumer's PR merges.

## 2. The new field

> "The consumer team wants to add `phoneNumber` to the User payload."

1. Consumer adds the field to the local response shape, updates the Pact
   matcher in `userClient.pact.test.js`, runs `npm test` → new pact published
   on the feature branch.
2. Provider CI fires from the broker webhook. Verification **fails** —
   provider doesn't return `phoneNumber` yet.
3. Provider team:
   - **If additive only**: implements the field, ships, verification turns
     green, consumer's PR merges.
   - **If breaking change** (e.g. consumer requires `phoneNumber` non-null):
     consumer's pact uses `like(undefined)` matcher to express tolerance, OR
     coordinates a release window (see *§4*).
4. Consumer's `can-i-deploy` against production passes only after provider's
   main-branch verification is green.

## 3. Rollback ownership

- **Provider rollback breaks consumers** → provider team owns the
  fix-forward. Consumers are paged via the broker's `pact-broker:provider:
  pact-published-with-failure` webhook subscriber.
- **Consumer rollback breaks no one** → consumer team's call alone.
- The `record-deployment` step in CI is what makes this knowable. Without
  it, `can-i-deploy` compares against stale metadata.

## 4. Coordinated breaking change

For a real breaking change (renaming a field, narrowing an enum):

1. Consumer + provider teams agree a **release window** in advance.
2. Consumer publishes the new pact tagged `--tag=breaking-2026-04-28`.
3. Provider implements both shapes behind a feature flag, verifies both
   pacts, deploys.
4. Consumer ships, dropping the old shape.
5. Provider removes the feature flag in a follow-up release.
6. The `--tag=breaking-2026-04-28` tag is removed from both pacticipants.

Never bypass `can-i-deploy` with `|| true` — that's an explicit
[ADR-0003](../../docs/adr/0003-can-i-deploy-as-hard-gate.md) violation.
Use `--ignore` with a Jira ticket reference if a temporary unsafe deploy is
genuinely required, and require a CODEOWNERS-blocked review.

## 5. Webhook configuration

In the Pact Broker UI (Webhooks → Add):

```yaml
events:
  - contract_content_changed
  - provider_verification_published
request:
  method: POST
  url: https://api.github.com/repos/${ORG}/${PROVIDER_REPO}/actions/workflows/contract-tests.yml/dispatches
  headers:
    Accept: application/vnd.github+json
    Authorization: token ${secrets.GITHUB_PAT_WITH_WORKFLOW_DISPATCH}
  body:
    ref: main
    inputs:
      consumer_version: ${pactbroker.consumerVersionNumber}
      consumer_branch:  ${pactbroker.consumerVersionBranch}
      pact_url:         ${pactbroker.pactUrl}
```

The PAT needs `workflow` scope. In production swap for OIDC federation —
GitHub OIDC tokens can be exchanged for a short-lived broker token.

## 6. Broker outage

If the broker is unreachable during CI:

- **Consumer publish step**: the workflow exits non-zero. **Do not** add a
  fallback. A consumer that can't publish is a consumer that can't be safely
  deployed — that's the correct signal.
- **Provider verify step**: same.
- **`can-i-deploy`**: the CLI exits non-zero by default on unreachable
  broker. Treat it like a red gate.
- **Status page**: add the broker URL to the team's StatusPage. Broker
  downtime is a release-blocking incident, not a "we'll merge anyway"
  situation.

## 7. Multi-consumer scale

This demo shows OrderService → UserService. In production:

- Provider's CI verifies against pacts from **every consumer** registered
  in the broker. Cross-consumer verification time grows linearly; expect
  ~10–30s per consumer in CI.
- Above ~10 consumers, switch to the broker's `pending` and `WIP` modes so
  feature-branch consumers don't block main-branch provider deploys.
- Consumer teams set their own `--branch` per feature so the provider can
  filter via `--consumer-version-selectors '[{"branch":"main"},{"deployedOrReleased":true}]'`.

This complexity is the reason `phase-2-contract-testing/` is a single
consumer/provider pair — the principles transfer; the topology doesn't
need to be demonstrated to be understood.
