/**
 * Consumer Pact Tests — Order Service → User Service
 *
 * Each `provider.addInteraction()` block defines one interaction:
 *   1. The request this consumer sends
 *   2. The minimum response shape it needs (using matchers, not exact values)
 *
 * State names are imported from a shared module that the provider also
 * consumes — a typo would fail at module load, not silently bypass a handler.
 *
 * Running these tests generates:
 *   ../pacts/OrderService-UserService.json
 *
 * That file is the contract the provider must satisfy.
 */
const path = require('path');
const { PactV3, MatchersV3 } = require('@pact-foundation/pact');
const { getUser, createUser, listUsers, deleteUser } = require('./userClient');
const { STATES } = require('./states');

const { like, eachLike, integer, string, regex } = MatchersV3;

// Role is an enum on the provider — express the same constraint here.
const ROLE_REGEX = '^(admin|viewer|editor)$';
const role = (example = 'admin') => regex(ROLE_REGEX, example);

const provider = new PactV3({
  consumer: 'OrderService',
  provider: 'UserService',
  dir: path.resolve(__dirname, '../../pacts'),
  logLevel: 'warn',
});

// ===========================================================================
// GET /users/:id — read happy + 404 + 400 (negative paths in the contract)
// ===========================================================================
describe('GET /users/:id', () => {
  it('returns an existing user', async () => {
    await provider
      .given(STATES.USER_1_EXISTS)
      .uponReceiving('a GET request for user 1')
      .withRequest({
        method: 'GET',
        path: '/users/1',
        headers: { Accept: 'application/json' },
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: like({
          id: integer(1),
          name: string('Alice'),
          email: regex('\\S+@\\S+\\.\\S+', 'alice@example.com'),
          role: role('admin'),
        }),
      })
      .executeTest(async (mockServer) => {
        process.env.USER_SERVICE_URL = mockServer.url;
        const user = await getUser(1);
        expect(typeof user.id).toBe('number');
        expect(user.email).toMatch(/\S+@\S+\.\S+/);
        expect(user.role).toMatch(new RegExp(ROLE_REGEX));
      });
  });

  it('returns 404 for a non-existent user', async () => {
    await provider
      .given(STATES.USER_999_DOES_NOT_EXIST)
      .uponReceiving('a GET request for non-existent user 999')
      .withRequest({
        method: 'GET',
        path: '/users/999',
        headers: { Accept: 'application/json' },
      })
      .willRespondWith({
        status: 404,
        headers: { 'Content-Type': 'application/json' },
        body: like({ error: string('User not found') }),
      })
      .executeTest(async (mockServer) => {
        process.env.USER_SERVICE_URL = mockServer.url;
        await expect(getUser(999)).rejects.toMatchObject({
          response: { status: 404 },
        });
      });
  });

  it('returns 400 when the id is not a positive integer', async () => {
    await provider
      .given(STATES.AT_LEAST_ONE_USER)
      .uponReceiving('a GET request with a malformed id')
      .withRequest({
        method: 'GET',
        path: '/users/abc',
        headers: { Accept: 'application/json' },
      })
      .willRespondWith({
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        body: like({ error: string('id must be a positive integer') }),
      })
      .executeTest(async (mockServer) => {
        process.env.USER_SERVICE_URL = mockServer.url;
        await expect(getUser('abc')).rejects.toMatchObject({
          response: { status: 400 },
        });
      });
  });
});

// ===========================================================================
// GET /users — list
// ===========================================================================
describe('GET /users', () => {
  it('returns a non-empty list', async () => {
    await provider
      .given(STATES.AT_LEAST_ONE_USER)
      .uponReceiving('a GET request for all users')
      .withRequest({
        method: 'GET',
        path: '/users',
        headers: { Accept: 'application/json' },
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: eachLike({
          id: integer(1),
          name: string('Alice'),
          email: regex('\\S+@\\S+\\.\\S+', 'alice@example.com'),
          role: role('admin'),
        }),
      })
      .executeTest(async (mockServer) => {
        process.env.USER_SERVICE_URL = mockServer.url;
        const users = await listUsers();
        expect(Array.isArray(users)).toBe(true);
        expect(users.length).toBeGreaterThan(0);
        expect(typeof users[0].id).toBe('number');
      });
  });
});

// ===========================================================================
// POST /users — happy + 409 conflict + 400 validation (closes Phase 2 audit gap)
// ===========================================================================
describe('POST /users', () => {
  it('creates a new user and returns 201', async () => {
    await provider
      .given(STATES.EMAIL_AVAILABLE_CAROL)
      .uponReceiving('a POST request to create user carol@example.com')
      .withRequest({
        method: 'POST',
        path: '/users',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: { name: 'Carol', email: 'carol@example.com', role: 'editor' },
      })
      .willRespondWith({
        status: 201,
        headers: { 'Content-Type': 'application/json' },
        body: like({
          id: integer(3),
          name: string('Carol'),
          email: regex('\\S+@\\S+\\.\\S+', 'carol@example.com'),
          role: role('editor'),
        }),
      })
      .executeTest(async (mockServer) => {
        process.env.USER_SERVICE_URL = mockServer.url;
        const user = await createUser({
          name: 'Carol',
          email: 'carol@example.com',
          role: 'editor',
        });
        expect(typeof user.id).toBe('number');
        expect(user.email).toBe('carol@example.com');
      });
  });

  it('returns 409 when the email already belongs to another user', async () => {
    await provider
      .given(STATES.USER_1_EXISTS) // alice@example.com is in the seed
      .uponReceiving('a POST that duplicates an existing email')
      .withRequest({
        method: 'POST',
        path: '/users',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: { name: 'AliceClone', email: 'alice@example.com', role: 'viewer' },
      })
      .willRespondWith({
        status: 409,
        headers: { 'Content-Type': 'application/json' },
        body: like({ error: string('Email already in use') }),
      })
      .executeTest(async (mockServer) => {
        process.env.USER_SERVICE_URL = mockServer.url;
        await expect(
          createUser({ name: 'AliceClone', email: 'alice@example.com', role: 'viewer' }),
        ).rejects.toMatchObject({ response: { status: 409 } });
      });
  });

  it('returns 400 when the payload is missing required fields', async () => {
    await provider
      .given(STATES.AT_LEAST_ONE_USER)
      .uponReceiving('a POST with no role specified')
      .withRequest({
        method: 'POST',
        path: '/users',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: { name: 'Dave', email: 'dave@example.com' },
      })
      .willRespondWith({
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        body: like({ error: string('role must be one of admin, viewer, editor') }),
      })
      .executeTest(async (mockServer) => {
        process.env.USER_SERVICE_URL = mockServer.url;
        await expect(
          createUser({ name: 'Dave', email: 'dave@example.com' }),
        ).rejects.toMatchObject({ response: { status: 400 } });
      });
  });
});

// ===========================================================================
// DELETE /users/:id — happy + 404 (closes Phase 2 audit gap)
// ===========================================================================
describe('DELETE /users/:id', () => {
  it('deletes an existing user and returns 204', async () => {
    await provider
      .given(STATES.USER_1_EXISTS)
      .uponReceiving('a DELETE request for user 1')
      .withRequest({
        method: 'DELETE',
        path: '/users/1',
      })
      .willRespondWith({ status: 204 })
      .executeTest(async (mockServer) => {
        process.env.USER_SERVICE_URL = mockServer.url;
        await expect(deleteUser(1)).resolves.toBe(true);
      });
  });

  it('returns 404 when deleting a non-existent user', async () => {
    await provider
      .given(STATES.USER_999_DOES_NOT_EXIST)
      .uponReceiving('a DELETE request for non-existent user 999')
      .withRequest({
        method: 'DELETE',
        path: '/users/999',
      })
      .willRespondWith({
        status: 404,
        headers: { 'Content-Type': 'application/json' },
        body: like({ error: string('User not found') }),
      })
      .executeTest(async (mockServer) => {
        process.env.USER_SERVICE_URL = mockServer.url;
        await expect(deleteUser(999)).rejects.toMatchObject({
          response: { status: 404 },
        });
      });
  });
});
