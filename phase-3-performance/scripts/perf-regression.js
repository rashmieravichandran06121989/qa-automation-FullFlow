#!/usr/bin/env node
/**
 * Run-to-run perf regression detector.
 *
 * Audit fix (was P0): the previous CI just compared each run against
 * static thresholds. A 30% creep in p95 from 320 ms → 416 ms passed every
 * gate (because the SLA was 500 ms) but is exactly the kind of regression
 * a Principal SDET expects to be caught.
 *
 * Strategy:
 *   1. Read the current run's k6 --summary-export JSON.
 *   2. Pull the previous run's summary from a known location (last
 *      successful CI artefact, downloaded by the workflow before this step).
 *   3. Compare key percentiles; flag any metric where the current run is
 *      worse than the baseline by more than the configured tolerance.
 *
 * Exit codes:
 *   0 — no regressions
 *   1 — regression detected
 *   2 — baseline missing (treated as soft-warn unless STRICT=1)
 *
 * Usage:
 *   node scripts/perf-regression.js reports/load-summary.json [reports/baseline-summary.json]
 *
 * The baseline argument defaults to `reports/baseline-summary.json`. CI is
 * expected to populate that file from the previous green main run via
 * `actions/download-artifact`.
 */
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const TOLERANCE_PCT = Number(process.env.PERF_TOLERANCE_PCT ?? "15"); // 15 % default
const STRICT = process.env.STRICT === "1";

// Metrics we gate on. Anything else in the summary is informational.
const GATED_METRICS = [
  { metric: "http_req_duration", stat: "p(95)" },
  { metric: "http_req_duration", stat: "p(99)" },
  { metric: "http_req_failed", stat: "rate" },
];

function load(file) {
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    fail(`Could not parse ${file}: ${e.message}`);
  }
}

function pluck(summary, metric, stat) {
  // k6 summary shape: { metrics: { http_req_duration: { values: { 'p(95)': 320 } } } }
  return summary?.metrics?.[metric]?.values?.[stat];
}

function fmt(v) {
  return typeof v === "number" ? v.toFixed(2) : String(v);
}

function fail(msg) {
  process.stderr.write(`::error::${msg}\n`);
  process.exit(1);
}

function warn(msg) {
  process.stderr.write(`::warning::${msg}\n`);
}

function note(msg) {
  process.stdout.write(`${msg}\n`);
}

// ---------------------------------------------------------------------------
function main() {
  const [currentArg, baselineArg] = process.argv.slice(2);
  if (!currentArg) {
    fail("Usage: perf-regression.js <current-summary.json> [<baseline-summary.json>]");
  }

  const baselinePath = baselineArg ?? path.join(path.dirname(currentArg), "baseline-summary.json");
  const current = load(currentArg);
  const baseline = load(baselinePath);

  if (!current) fail(`Current summary not found at ${currentArg}`);

  if (!baseline) {
    const m = `No baseline at ${baselinePath} — first run on this branch?`;
    if (STRICT) fail(m);
    warn(m);
    process.exit(2);
  }

  let regressions = 0;
  note(`Regression check (tolerance: ${TOLERANCE_PCT}%, strict: ${STRICT})`);
  note("───────────────────────────────────────────────");

  for (const { metric, stat } of GATED_METRICS) {
    const cur = pluck(current, metric, stat);
    const old = pluck(baseline, metric, stat);
    if (cur === undefined || old === undefined) {
      warn(`${metric} ${stat}: missing in one of the two summaries — skipped`);
      continue;
    }
    if (old === 0) {
      note(`${metric} ${stat}: baseline 0 — cannot compute % delta, skipped`);
      continue;
    }
    const deltaPct = ((cur - old) / old) * 100;
    const verdict =
      deltaPct > TOLERANCE_PCT ? "REGRESSION" : deltaPct < -TOLERANCE_PCT ? "IMPROVED" : "within";
    const arrow = deltaPct >= 0 ? "↑" : "↓";
    note(
      `${metric} ${stat}: ${fmt(old)} → ${fmt(cur)} (${arrow} ${deltaPct.toFixed(1)}%) — ${verdict}`,
    );
    if (verdict === "REGRESSION") regressions++;
  }

  note("───────────────────────────────────────────────");
  if (regressions > 0) {
    fail(`${regressions} metric(s) regressed beyond the ${TOLERANCE_PCT}% tolerance.`);
  }
  note("No regressions detected.");
  process.exit(0);
}

main();
