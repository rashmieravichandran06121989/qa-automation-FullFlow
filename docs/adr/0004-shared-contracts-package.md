# ADR-0004 — `packages/contracts/` as the cross-phase schema source of truth

- **Status:** Accepted
- **Date:** 2026-04-28
- **Affects:** `packages/contracts/`, Phase 1 API tests, Phase 3 data factory

## Context

The audit (Part 1) flagged that the same upstream schema (the
jsonplaceholder Posts and Users contract) was effectively re-described three
times: once in Phase 1's API tests as inline `expect` shapes, once in Phase 2
as Pact matchers, once in Phase 3's data factory as POST seeds. A change in
the upstream contract would have to be reflected in three places, and only
one of them — Pact — would catch a real drift.

## Decision

Introduce a **single Zod-based contracts module** at `packages/contracts/`
that exports runtime validators (`PostSchema`, `UserSchema`) and inferred
TypeScript types. Phase 1 API tests parse responses through these validators.
Phase 3's data factory builds POST payloads from these types. Phase 2's Pact
matchers remain the canonical contract source for the consumer/provider pair
themselves — but the *cross-phase* shape is owned here.

## Why Zod?

- Runtime validation, not just compile-time types.
- `z.infer<typeof Schema>` makes the type the same object as the runtime check.
- Smaller surface than Ajv; better TS DX than JSON Schema.

## Consequences

- Phase 1 API tests now fail fast on schema drift, not just on assertion drift.
  An upstream that returns a `userId: "1"` (string) when we expect `userId: 1`
  (number) breaks immediately at `parse()` rather than ten asserts later.
- Phase 3 stops carrying its own seed array; the factory imports types and
  fills with Faker.
- Phase 2's Pact matchers are *not* generated from these schemas — that's
  intentional. Pact is the contract between *us* and the provider; the
  contracts package is the type contract between *our internal phases.*

## Cost

- One more package to maintain. Marginal — schemas are tiny.
- Slight indirection in Phase 1 API tests: `expect(response).toEqual(payload)`
  becomes `PostSchema.parse(await response.json())` plus assertions. That's a
  feature, not a regression.
