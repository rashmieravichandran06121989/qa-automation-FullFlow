# ADR-0002 — k6 stress test uses ramping-arrival-rate, not ramping-vus

- **Status:** Accepted
- **Date:** 2026-04-28
- **Affects:** `phase-3-performance/tests/stress/stress-test.ts`

## Context

For the stress test, we need to find the breaking point of the system under
test (SUT). k6 offers two relevant executors:

- `ramping-vus` — controls *concurrency* (number of virtual users)
- `ramping-arrival-rate` — controls *throughput* (iterations per time unit)

Under degradation, these behave very differently.

## Decision

Use **`ramping-arrival-rate`** for the stress test, ramping from 20 → 200
req/s. Pre-allocate enough VUs to absorb queueing (`preAllocatedVUs: 50`,
`maxVUs: 300`).

## Why

The point of a stress test is to **maintain pressure** on the SUT as it
degrades, so we observe the saturation curve.

- With `ramping-vus`, when the SUT slows down, each VU's iteration takes
  longer, and **k6 automatically reduces actual req/s.** You walk the SUT to
  the cliff — but you never push it off, because the load auto-throttles. You
  miss the actual failure mode.
- With `ramping-arrival-rate`, k6 spawns *more VUs* to meet the target rate
  as latency rises. You hold the pressure constant. The SUT either keeps up,
  queues, or breaks visibly.

## Consequences

- Pre-allocated VUs must be sized to the worst-case latency. We chose 50 / 300
  for jsonplaceholder; a real target should derive these from a baseline run.
- `dropped_iterations` becomes a meaningful threshold (we set `< 100`) — it
  signals that k6 itself couldn't generate the requested rate, which is a
  saturation signal.
- Retries are disabled in the stress profile (`maxAttempts(1)`) so we don't
  mask failures with retry success.

## Tradeoff acknowledged

`ramping-vus` is the right choice when the question is "how many *concurrent
users* can we support?" — e.g., for a synchronous, session-heavy app where
each user holds a connection. For a stateless REST API, throughput-driven
load is the truthful answer to "how much can it take?" — hence the choice
above.

## References

- k6 docs on executors: https://grafana.com/docs/k6/latest/using-k6/scenarios/executors/
- "Why your load test is lying to you": k6 community talk, Grafana ObservabilityCON 2023
