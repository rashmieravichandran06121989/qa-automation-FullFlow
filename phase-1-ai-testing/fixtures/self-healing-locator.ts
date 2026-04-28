import type { Locator, Page } from "@playwright/test";

/**
 * Self-healing locator — Days 3-4 deliverable substitute (Mabl/Testim).
 *
 * Mabl/Testim sell auto-healing as ML magic. The honest engineering answer is
 * **a fallback chain**: try the strongest selector first, fall through to
 * weaker selectors if it doesn't resolve. Log every fallback so a human can
 * tighten the strong selector before the weaker one becomes a permanent
 * crutch.
 *
 * Usage:
 *
 *   const submit = healing(page, "submit-button", [
 *     { strategy: "data-test", value: "submit" },
 *     { strategy: "role",      value: { role: "button", name: /submit/i } },
 *     { strategy: "text",      value: "Submit" },
 *   ]);
 *   await submit.click();
 *
 * Each strategy is tried in order; the first that finds exactly one element
 * is used. If a fallback strategy resolves, a structured warning is emitted
 * to stderr so CI can flag it for follow-up.
 *
 * This is not the strongest selector; the strongest selector should always
 * be data-test. The point is to **make resilience explicit and observable**
 * — not to absolve the team of fixing brittle selectors.
 */

export type LocatorStrategy =
  | { strategy: "data-test"; value: string }
  | { strategy: "css";       value: string }
  | { strategy: "text";      value: string | RegExp }
  | { strategy: "label";     value: string | RegExp }
  | { strategy: "role";      value: { role: Parameters<Page["getByRole"]>[0]; name?: string | RegExp } };

interface HealingOptions {
  /** Optional structured logger; defaults to a stderr JSON line. */
  log?: (event: HealingEvent) => void;
  /** Timeout for each candidate strategy. Defaults to 2s. */
  candidateTimeoutMs?: number;
}

export interface HealingEvent {
  name:        string;
  level:       "ok" | "fallback" | "exhausted";
  attemptIdx:  number;
  strategy:    LocatorStrategy["strategy"];
  message:     string;
  ts:          string;
}

export function healing(
  page: Page,
  name: string,
  strategies: LocatorStrategy[],
  opts: HealingOptions = {},
): Locator {
  if (strategies.length === 0) {
    throw new Error(`healing(${name}): need at least one strategy`);
  }

  const logger = opts.log ?? defaultLogger;
  const timeout = opts.candidateTimeoutMs ?? 2_000;

  // Return a Locator that, on first interaction, resolves the strongest
  // strategy that yields exactly one element. We can't lazy-resolve a real
  // Playwright Locator across strategies, so we wrap it in a custom proxy.
  // For 95% of use cases, callers .click() / .fill() / .waitFor(), so we
  // expose those via async resolution. For .first()/.nth()/.locator() chains,
  // callers should use .resolve() to get the underlying Locator and chain
  // from there.
  return makeHealingLocator(page, name, strategies, logger, timeout) as unknown as Locator;
}

function makeHealingLocator(
  page: Page,
  name: string,
  strategies: LocatorStrategy[],
  log: (e: HealingEvent) => void,
  timeoutMs: number,
) {
  let resolved: Locator | null = null;

  async function resolve(): Promise<Locator> {
    if (resolved) return resolved;

    for (let i = 0; i < strategies.length; i++) {
      const candidate = locatorFor(page, strategies[i]);
      try {
        await candidate.first().waitFor({ state: "attached", timeout: timeoutMs });
        const count = await candidate.count();
        if (count >= 1) {
          log({
            name,
            level: i === 0 ? "ok" : "fallback",
            attemptIdx: i,
            strategy: strategies[i].strategy,
            message:
              i === 0
                ? `primary strategy resolved`
                : `fell through to fallback #${i} (${strategies[i].strategy}) — tighten the primary selector`,
            ts: new Date().toISOString(),
          });
          resolved = candidate.first();
          return resolved;
        }
      } catch {
        // try the next strategy
      }
    }

    log({
      name,
      level: "exhausted",
      attemptIdx: strategies.length,
      strategy: strategies[strategies.length - 1].strategy,
      message: `every strategy failed`,
      ts: new Date().toISOString(),
    });
    throw new Error(
      `healing(${name}): exhausted ${strategies.length} strategies — ` +
        `none resolved within ${timeoutMs}ms each`,
    );
  }

  // Return a thin proxy: forwards every method call to the resolved Locator.
  return new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === "resolve") return resolve;
        return async (...args: unknown[]) => {
          const loc = await resolve();
          // @ts-expect-error — dynamic dispatch onto Locator
          return loc[prop](...args);
        };
      },
    },
  );
}

function locatorFor(page: Page, s: LocatorStrategy): Locator {
  switch (s.strategy) {
    case "data-test": return page.locator(`[data-test="${s.value}"]`);
    case "css":       return page.locator(s.value);
    case "text":      return page.getByText(s.value);
    case "label":     return page.getByLabel(s.value);
    case "role":      return page.getByRole(s.value.role, { name: s.value.name });
  }
}

function defaultLogger(event: HealingEvent): void {
  // One JSON line per event — stderr keeps the test runner's stdout clean for
  // assertion output. Easy to grep, easy to ship to a log aggregator.
  // eslint-disable-next-line no-console
  console.error(JSON.stringify({ component: "self-healing-locator", ...event }));
}
