import { test, expect } from '@playwright/test';
import { z } from 'zod';

/**
 * GraphQL surface — closes the Days 13-14 plan deliverable
 * ("GraphQL with Playwright + Postman").
 *
 * Target: https://countries.trevorblades.com — a public, schema-stable
 * GraphQL API used widely in tutorials. No auth, no rate limit at
 * portfolio-test volumes, and the schema hasn't churned in 5+ years.
 *
 * Why a separate file? UI tests hit OrangeHRM/SauceDemo, REST tests hit
 * jsonplaceholder, and GraphQL is a different transport with different
 * negative-path semantics (200 OK with `errors:[]` on a field-level failure
 * vs HTTP 4xx on a transport failure). Conflating them muddies the diagnosis.
 */

const GRAPHQL_URL = 'https://countries.trevorblades.com/';

// --- Schemas (also published by upstream introspection — in production we'd
// generate these via codegen; hand-written here keeps the demo dependency-light)
const CountrySchema = z.object({
  code: z.string().length(2),
  name: z.string().min(1),
  capital: z.string().nullable(),
  emoji: z.string().min(1),
});
const CountryQueryResponse = z.object({
  data: z.object({ country: CountrySchema.nullable() }),
  errors: z.array(z.object({ message: z.string() })).optional(),
});

test.describe('GraphQL — countries.trevorblades.com', () => {
  test('query Country(NL) returns the expected country shape', async ({
    request,
  }) => {
    const res = await request.post(GRAPHQL_URL, {
      data: {
        query: /* GraphQL */ `
          query GetCountry($code: ID!) {
            country(code: $code) {
              code
              name
              capital
              emoji
            }
          }
        `,
        variables: { code: 'NL' },
      },
    });
    expect(res.status()).toBe(200);

    // Always parse the envelope first; GraphQL errors arrive at HTTP 200.
    const parsed = CountryQueryResponse.parse(await res.json());
    expect(parsed.errors).toBeUndefined();
    expect(parsed.data.country).toMatchObject({
      code: 'NL',
      name: 'Netherlands',
      capital: 'Amsterdam',
    });
  });

  test('query Country(ZZ) returns null in `data.country` (not an HTTP error)', async ({
    request,
  }) => {
    const res = await request.post(GRAPHQL_URL, {
      data: {
        query: `query { country(code: "ZZ") { code name } }`,
      },
    });
    expect(res.status()).toBe(200);
    const parsed = CountryQueryResponse.parse(await res.json());
    expect(parsed.data.country).toBeNull();
  });

  test('malformed query returns errors[]', async ({ request }) => {
    const res = await request.post(GRAPHQL_URL, {
      data: { query: 'query { country(code: NL) { codeButMisspelt } }' },
    });
    // GraphQL convention: validation errors return 400. trevorblades returns
    // 400 with errors[] populated.
    expect([200, 400]).toContain(res.status());
    const body = await res.json();
    expect(Array.isArray(body.errors)).toBe(true);
    expect(body.errors.length).toBeGreaterThan(0);
  });
});
