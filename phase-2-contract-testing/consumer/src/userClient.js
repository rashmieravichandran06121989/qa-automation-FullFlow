/**
 * UserClient — HTTP client for the Order Service to call the User Service.
 *
 * Design notes:
 *  - Base URL is read from USER_SERVICE_URL on every call so the pact mock
 *    server can be swapped in at test time without rebuilding the client.
 *  - **No client-side payload validation.** The server's contract is the
 *    source of truth — letting the client pre-validate creates two contracts
 *    (the client's expectations + the server's), and they drift. The whole
 *    point of consumer-driven contracts is that the consumer documents what
 *    the server promises; we don't replicate that as defensive client code.
 *  - The only thing the client validates is the SHAPE of arguments it
 *    constructs URLs from (e.g. `id` must be coerceable to a string segment),
 *    because a bad id never reaches a meaningful HTTP request.
 *  - Fail with rich errors that include the response so callers can branch
 *    on response.status (the contract tests rely on this).
 */
'use strict';

const axios = require('axios');

const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_BASE_URL   = 'http://localhost:3001';

const baseUrl = () => process.env.USER_SERVICE_URL || DEFAULT_BASE_URL;

const jsonHeaders = (extra = {}) => ({
  Accept: 'application/json',
  ...extra,
});

const requestConfig = (extraHeaders) => ({
  timeout: DEFAULT_TIMEOUT_MS,
  headers: jsonHeaders(extraHeaders),
  // Don't auto-throw on 4xx — we let callers branch on status. axios's
  // default `validateStatus` rejects everything except 2xx; we narrow it
  // explicitly so 1xx/5xx still throws (those are real errors), 4xx
  // becomes a thrown error that carries response.status (contract tests
  // assert on this), and 2xx returns normally.
  validateStatus: (s) => s >= 200 && s < 300,
});

const assertIdPart = (id) => {
  if (id === null || id === undefined) {
    throw new TypeError('id is required');
  }
};

async function getUser(userId) {
  assertIdPart(userId);
  const { data } = await axios.get(
    `${baseUrl()}/users/${encodeURIComponent(userId)}`,
    requestConfig(),
  );
  return data;
}

async function listUsers() {
  const { data } = await axios.get(`${baseUrl()}/users`, requestConfig());
  return data;
}

async function createUser(payload) {
  const { data } = await axios.post(
    `${baseUrl()}/users`,
    payload,
    requestConfig({ 'Content-Type': 'application/json' }),
  );
  return data;
}

async function deleteUser(userId) {
  assertIdPart(userId);
  await axios.delete(
    `${baseUrl()}/users/${encodeURIComponent(userId)}`,
    requestConfig(),
  );
  return true;
}

module.exports = { getUser, createUser, listUsers, deleteUser };
