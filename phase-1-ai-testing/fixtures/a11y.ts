import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, type TestInfo } from "@playwright/test";

/**
 * Accessibility helper — closes the audit gap "no a11y check anywhere".
 *
 * Wraps @axe-core/playwright with portfolio defaults:
 *   - WCAG 2.1 A + AA tags (the legal floor for most EU products)
 *   - serious + critical violations only (warn-track everything else)
 *   - Allure attachment with the JSON report so reviewers can see findings
 *     without re-running the test
 *
 * Use it like:
 *
 *   await assertAccessible(page, testInfo, "OrangeHRM dashboard");
 *
 * Why a wrapper? The default AxeBuilder API is fine but produces verbose
 * output and easy-to-suppress reports. Centralising the policy means a single
 * change updates the rules across the suite — and the output becomes a
 * predictable artefact a Quality Architect can audit at scale.
 */

export interface A11yResult {
  passes: number;
  violationsBlocking: number;
  violationsAdvisory: number;
}

const BLOCKING_IMPACT = new Set(["serious", "critical"]);

export async function assertAccessible(
  page: Page,
  testInfo: TestInfo,
  label: string,
): Promise<A11yResult> {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  const blocking = results.violations.filter((v) =>
    BLOCKING_IMPACT.has(v.impact ?? ""),
  );
  const advisory = results.violations.filter(
    (v) => !BLOCKING_IMPACT.has(v.impact ?? ""),
  );

  // Always attach the full report — even on pass — so reviewers can see the
  // a11y trajectory over time, not just the failures.
  await testInfo.attach(`a11y-${label}.json`, {
    body: Buffer.from(JSON.stringify(results, null, 2)),
    contentType: "application/json",
  });

  if (blocking.length > 0) {
    const summary = blocking
      .map((v) => `  • [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node${v.nodes.length === 1 ? "" : "s"})`)
      .join("\n");
    expect(
      blocking,
      `Accessibility — ${label} — ${blocking.length} blocking violation(s):\n${summary}`,
    ).toHaveLength(0);
  }

  return {
    passes:             results.passes.length,
    violationsBlocking: blocking.length,
    violationsAdvisory: advisory.length,
  };
}
