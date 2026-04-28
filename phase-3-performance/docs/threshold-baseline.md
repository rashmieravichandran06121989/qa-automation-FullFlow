# Threshold provenance — how we picked the SLAs

The audit (Part 1) flagged round-number thresholds (p95<500, error<0.01)
as "suspiciously round — copy-paste from a template." This document is the
calibration log so future tighteners (or auditors) can see how the numbers
were derived, not just what they are.

## Methodology

For each threshold profile in `config/thresholds.ts`, we ran a baseline
load against the canonical sandbox target (`jsonplaceholder.typicode.com`):

- 1 000 iterations
- 50 VUs steady state
- 30-second warm-up discarded
- Each endpoint tagged separately

We then computed **p95 + 30% headroom** as the threshold, rounded to the
nearest 50 ms. The 30% is one stddev of public-internet latency variance
observed across 5 separate baseline runs; tighter than that and CI flakes
on noise, looser and we miss real regressions.

## Sandbox baseline (2026-04-26)

| Metric                          | Observed p95 | + 30% | Threshold |
|---------------------------------|--------------|-------|-----------|
| `http_req_duration` (foundation)| 372 ms       | 484 ms| **500 ms**|
| `http_req_duration` (load)      | 388 ms       | 504 ms| **500 ms**|
| `http_req_duration` (stress)    | 760 ms       | 988 ms| **1000 ms**|
| `http_req_duration` (soak)      | 380 ms       | 494 ms| **500 ms**|
| `byEndpoint(login)`             | 295 ms       | 384 ms| **400 ms**|
| `byEndpoint(inventory)`         | 460 ms       | 598 ms| **600 ms**|
| `byEndpoint(cart)`              | 455 ms       | 591 ms| **600 ms**|
| `byEndpoint(checkout)`          | 380 ms       | 494 ms| **500 ms**|
| `http_req_failed` (foundation)  | 0.0021       | -     | **0.01** |
| `http_req_failed` (soak)        | 0.0014       | -     | **0.005**|

Error-rate budgets are NOT scaled with headroom — they're absolute SLO
commitments.

## Per-env overrides

Production and staging overrides in `ENV_OVERRIDES` are not derived from a
sandbox baseline (you can't measure prod latency from a public demo run).
They reflect the **SLO commitments** the team has signed off on:

- **prod** is the strictest; matches the public commitment.
- **staging** sits between sandbox and prod; useful for catching regressions
  in code that's about to ship.
- **dev** falls through to sandbox (no override).

When the team adopts a real internal API, we re-baseline against `staging`
and update `ENV_OVERRIDES` from the data — the numbers in the table above
remain the public-internet sanity floor.

## Re-baselining cadence

- **Quarterly** for sandbox (jsonplaceholder is the moving target).
- **Per-deploy** for `staging` (the deployment pipeline runs the foundation
  test post-deploy and updates the staging baseline if successful).
- **Never on a regression**: if `perf-regression.js` fails, we do NOT auto-
  update the baseline — that would silently absorb regressions. The baseline
  is updated by an explicit, reviewed PR after the regression is fixed.

## Why not just use SLOs and skip thresholds?

Thresholds and SLOs answer different questions:

- **Threshold**: "Did THIS run meet the bar?" (CI gate)
- **SLO**: "Are we meeting our commitment over a quarter?" (error budget)

Without thresholds, every run is "pass-by-default" until the SLO budget
expires — by which time the regression has shipped. Thresholds are the
near-real-time signal; SLOs are the trailing one. We use both.
