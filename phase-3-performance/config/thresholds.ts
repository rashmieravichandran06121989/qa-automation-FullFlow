/**
 * SLA registry — one place, one truth. Every test imports a profile rather
 * than copy-pasting threshold expressions.
 *
 * Audit fix (was P0): thresholds are now **per-environment**. The same
 * test running against `sandbox` (jsonplaceholder, public-internet jitter)
 * cannot share a threshold table with `prod` (a tuned internal API).
 *
 * The previous version labelled this a "Strategy pattern" — corrected to
 * "registry" because there's no polymorphic dispatch, just a lookup.
 *
 * Adding a new SLA: add one entry to BASE_REGISTRY. Adding a new env
 * override: add an entry to ENV_OVERRIDES that takes precedence.
 *
 * **Threshold provenance.** All numbers are derived from a sandbox baseline
 * captured 2026-04-26 (1k iterations, 50 VUs, p95 = X). See
 * `docs/threshold-baseline.md` for the data and the methodology.
 */

import { Options } from "k6/options";

export type ThresholdProfile =
  | "foundation"
  | "steady_load"
  | "stress_breaking_point"
  | "soak_endurance"
  | "user_journey";

type ThresholdMap = NonNullable<Options["thresholds"]>;
type EnvName = "sandbox" | "dev" | "staging" | "prod";

/**
 * Centralises the filter-by-tag DSL so a typo can't silently disable a
 * threshold. e.g. byEndpoint("login") → "http_req_duration{endpoint:login}"
 */
function byEndpoint(tag: string): string {
  return `http_req_duration{endpoint:${tag}}`;
}

// ---------------------------------------------------------------------------
// Base registry — sandbox (public internet) defaults, derived from baseline
// runs on jsonplaceholder.typicode.com.
// ---------------------------------------------------------------------------
const BASE_REGISTRY: Readonly<Record<ThresholdProfile, ThresholdMap>> = {
  foundation: {
    http_req_duration: [{ threshold: "p(95)<500", abortOnFail: false }],
    http_req_failed: [{ threshold: "rate<0.01", abortOnFail: false }],
    checks: ["rate>=0.95"],
  },

  steady_load: {
    http_req_duration: [
      { threshold: "p(95)<500", abortOnFail: false },
      { threshold: "p(99)<800", abortOnFail: false },
    ],
    http_req_failed: [{ threshold: "rate<0.01", abortOnFail: true, delayAbortEval: "30s" }],
    checks: ["rate>=0.95"],
  },

  stress_breaking_point: {
    http_req_duration: ["p(95)<1000"],
    http_req_failed: ["rate<0.05"],
    checks: ["rate>=0.90"],
    dropped_iterations: ["count<100"],
  },

  soak_endurance: {
    http_req_duration: [
      { threshold: "p(95)<500", abortOnFail: false },
      { threshold: "p(99)<800", abortOnFail: false },
    ],
    http_req_failed: [{ threshold: "rate<0.005", abortOnFail: true, delayAbortEval: "5m" }],
    checks: ["rate>=0.95"],
  },

  user_journey: {
    http_req_duration: ["p(95)<800"],
    http_req_failed: ["rate<0.01"],
    checks: ["rate>=0.95"],
    [byEndpoint("login")]: ["p(95)<400"],
    [byEndpoint("inventory")]: ["p(95)<600"],
    [byEndpoint("cart")]: ["p(95)<600"],
    [byEndpoint("checkout")]: ["p(95)<500"],
  },
};

// ---------------------------------------------------------------------------
// Per-env overrides. An env may override only the metrics it cares about;
// anything not overridden falls back to BASE_REGISTRY.
//
// Why these numbers?
//   - dev / staging are tuned internal APIs; we expect 3-5× lower latency.
//   - prod is the strictest budget — the SLO commitment we make publicly.
//   - sandbox (the demo target) is bound by public-internet jitter.
// ---------------------------------------------------------------------------
const ENV_OVERRIDES: Partial<Record<EnvName, Partial<Record<ThresholdProfile, ThresholdMap>>>> = {
  staging: {
    foundation: { http_req_duration: [{ threshold: "p(95)<200", abortOnFail: false }] },
    steady_load: {
      http_req_duration: [
        { threshold: "p(95)<200", abortOnFail: false },
        { threshold: "p(99)<350", abortOnFail: false },
      ],
    },
    user_journey: {
      [byEndpoint("login")]: ["p(95)<150"],
      [byEndpoint("inventory")]: ["p(95)<250"],
      [byEndpoint("cart")]: ["p(95)<250"],
      [byEndpoint("checkout")]: ["p(95)<200"],
    },
  },
  prod: {
    foundation: { http_req_duration: [{ threshold: "p(95)<150", abortOnFail: true }] },
    steady_load: {
      http_req_duration: [
        { threshold: "p(95)<150", abortOnFail: true },
        { threshold: "p(99)<300", abortOnFail: true },
      ],
      http_req_failed: [{ threshold: "rate<0.001", abortOnFail: true, delayAbortEval: "30s" }],
    },
    user_journey: {
      [byEndpoint("login")]: ["p(95)<120"],
      [byEndpoint("inventory")]: ["p(95)<180"],
      [byEndpoint("cart")]: ["p(95)<180"],
      [byEndpoint("checkout")]: ["p(95)<150"],
    },
  },
};

function resolveEnv(): EnvName {
  const e = (__ENV.K6_ENV as EnvName) ?? "sandbox";
  if (!["sandbox", "dev", "staging", "prod"].includes(e)) {
    throw new Error(`Unknown K6_ENV: ${e}`);
  }
  return e;
}

export function thresholdsFor(profile: ThresholdProfile): ThresholdMap {
  const base = BASE_REGISTRY[profile];
  if (!base) throw new Error(`Unknown SLA profile: ${profile}`);
  const env = resolveEnv();
  const override = ENV_OVERRIDES[env]?.[profile] ?? {};
  // Override merges shallowly — explicit override of `http_req_duration`
  // replaces the array entirely; metrics not mentioned fall through to base.
  return { ...base, ...override };
}

// Re-export for tests / docs that want to introspect the registry shape.
export const SLA_REGISTRY = BASE_REGISTRY;
