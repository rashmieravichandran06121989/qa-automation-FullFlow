/**
 * Credential resolver — env first, with explicit, audited demo defaults.
 *
 * The audit flagged the previous `?? 'secret_sauce'` pattern as a smell — it
 * looks like a footgun even though SauceDemo's password is documented on the
 * login page. The fix is not to remove the default (the demo is genuinely
 * public) but to **isolate** the default behind a feature flag so prod-shaped
 * environments fail loud if the env var is missing.
 *
 * Behaviour:
 *   - When `ALLOW_DEMO_DEFAULTS=1` (the default for local dev): demo
 *     credentials are returned if env vars are absent.
 *   - When `ALLOW_DEMO_DEFAULTS` is unset (the default in CI when targeting
 *     non-sandbox envs): a missing env var THROWS at module load with a
 *     pointer to .env.example.
 *
 * Framework code imports from `credentials`, never hardcodes passwords.
 */

const allowDemoDefaults =
  process.env.ALLOW_DEMO_DEFAULTS === '1' ||
  // Sandbox is the only env where demo creds are safe.
  (process.env.K6_ENV ?? 'sandbox') === 'sandbox';

function required(envKey: string, demoFallback: string): string {
  const v = process.env[envKey];
  if (v && v.length > 0) return v;
  if (allowDemoDefaults) return demoFallback;
  throw new Error(
    `Missing required env var ${envKey}. ` +
      `Either set it in your .env (see .env.example) or set ALLOW_DEMO_DEFAULTS=1 ` +
      `to fall through to the documented demo value.`,
  );
}

export const credentials = {
  sauceDemo: {
    // SauceDemo's test users are baked into the demo site and listed on its
    // login page — they're part of the public contract, not secrets.
    users: {
      standard: 'standard_user',
      lockedOut: 'locked_out_user',
      problem: 'problem_user',
      performanceGlitch: 'performance_glitch_user',
      error: 'error_user',
      visual: 'visual_user',
    },
    password: required('SAUCEDEMO_PASSWORD', 'secret_sauce'),
  },
  orangeHRM: {
    admin: {
      username: required('ORANGEHRM_ADMIN_USER', 'Admin'),
      password: required('ORANGEHRM_ADMIN_PASSWORD', 'admin123'),
    },
  },
} as const;
