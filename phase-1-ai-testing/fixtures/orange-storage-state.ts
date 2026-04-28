import { chromium, type FullConfig } from "@playwright/test";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { credentials } from "../config/credentials";

/**
 * globalSetup — caches a real OrangeHRM session into .auth/orangehrm.json so
 * every BDD scenario starts pre-authenticated. Without this each scenario
 * re-burns ~15 s on the UI login.
 *
 * Audit fix: previously this swallowed a login failure and wrote an empty
 * state, masking real outages with a green CI run that started failing later
 * with confusing "header not visible" messages. We now distinguish:
 *
 *   - **Local first-run, no prior cache**: try the login. If it fails, write
 *     an empty state and CONTINUE — devs can iterate on isolated tests
 *     without an OrangeHRM round-trip. Logged loudly so the dev sees it.
 *
 *   - **CI** (CI=true) **OR** REQUIRE_ORANGEHRM_AUTH=1: a login failure is
 *     a fatal setup error. The exception propagates, Playwright halts the
 *     run, and the failure mode is unambiguous.
 *
 * Three retries with linear backoff guard against transient demo-server
 * flakes.
 */

export const ORANGE_STORAGE_STATE = resolve(".auth/orangehrm.json");

const ORANGEHRM_BASE_URL =
  process.env.ORANGEHRM_BASE_URL ??
  "https://opensource-demo.orangehrmlive.com";

const EMPTY_STATE = JSON.stringify({ cookies: [], origins: [] });
const FAIL_LOUD =
  process.env.CI === "true" || process.env.REQUIRE_ORANGEHRM_AUTH === "1";
const MAX_ATTEMPTS = 3;

export default async function globalSetup(_: FullConfig): Promise<void> {
  mkdirSync(dirname(ORANGE_STORAGE_STATE), { recursive: true });

  if (!existsSync(ORANGE_STORAGE_STATE)) {
    writeFileSync(ORANGE_STORAGE_STATE, EMPTY_STATE);
  }

  let lastErr: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await login();
      // eslint-disable-next-line no-console
      console.log(
        `[globalSetup] OrangeHRM storageState cached on attempt ${attempt} → ${ORANGE_STORAGE_STATE}`,
      );
      return;
    } catch (err) {
      lastErr = err;
      process.stderr.write(
        `[globalSetup] OrangeHRM login attempt ${attempt}/${MAX_ATTEMPTS} failed: ${oneLine(err)}\n`,
      );
      if (attempt < MAX_ATTEMPTS) {
        await delay(2_000 * attempt);
      }
    }
  }

  if (FAIL_LOUD) {
    throw new Error(
      `[globalSetup] OrangeHRM login failed after ${MAX_ATTEMPTS} attempts. ` +
        `Refusing to start CI with empty auth state. Last error: ${oneLine(lastErr)}`,
    );
  }

  process.stderr.write(
    `[globalSetup] OrangeHRM login failed after ${MAX_ATTEMPTS} attempts. ` +
      `Continuing with empty state because we're not in CI. ` +
      `Set REQUIRE_ORANGEHRM_AUTH=1 locally to fail fast instead.\n`,
  );
}

async function login(): Promise<void> {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`${ORANGEHRM_BASE_URL}/web/index.php/auth/login`, {
      timeout: 30_000,
    });
    await page
      .getByPlaceholder("Username")
      .fill(credentials.orangeHRM.admin.username);
    await page
      .getByPlaceholder("Password")
      .fill(credentials.orangeHRM.admin.password);
    await page.getByRole("button", { name: "Login" }).click();
    await page
      .getByRole("heading", { name: "Dashboard" })
      .waitFor({ timeout: 30_000 });
    await context.storageState({ path: ORANGE_STORAGE_STATE });
  } finally {
    await browser.close();
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function oneLine(e: unknown): string {
  return ((e as Error)?.message ?? String(e)).replace(/\s+/g, " ").slice(0, 200);
}
