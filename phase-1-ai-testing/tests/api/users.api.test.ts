import { test, expect } from "@playwright/test";
import { UserListSchema, UserSchema } from "./schemas";

/**
 * jsonplaceholder read-side tests. Every response is funnelled through a
 * Zod schema so a server-side change to the contract (e.g. `id` becomes a
 * string, `email` becomes optional) fails the build at parse time with a
 * precise diagnostic, not three asserts later with a generic mismatch.
 */
test.describe("jsonplaceholder — users (schema-validated reads)", () => {
  test("GET /users returns a non-empty list whose every entry matches UserSchema", async ({
    request,
  }) => {
    const res = await request.get("/users");
    expect(res.status()).toBe(200);

    // UserListSchema enforces: array, non-empty, each element ↔ UserSchema.
    const users = UserListSchema.parse(await res.json());
    expect(users.length).toBeGreaterThanOrEqual(10);
  });

  test("GET /users/1 returns a single user matching UserSchema", async ({
    request,
  }) => {
    const res = await request.get("/users/1");
    expect(res.status()).toBe(200);
    const user = UserSchema.parse(await res.json());
    expect(user.id).toBe(1);
  });

  test("GET /users/9999 returns 404 — body must NOT match UserSchema", async ({
    request,
  }) => {
    const res = await request.get("/users/9999");
    expect(res.status()).toBe(404);
    expect(UserSchema.safeParse(await res.json()).success).toBe(false);
  });
});
