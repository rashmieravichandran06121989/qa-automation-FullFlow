/**
 * Shared provider state names — single source of truth.
 *
 * The previous version of the consumer used inline strings like
 *     given('user with ID 1 exists')
 * while the provider exported `STATES` constants from
 * `provider/pact/stateHandlers.js`. A typo on either side would silently
 * bypass the handler — the interaction would still match, but with no
 * state setup, leaving a hidden green test.
 *
 * This module mirrors the provider's STATES object exactly. If anyone
 * adds a new state on the provider, mirror it here too. A future tightening
 * is to publish `provider/pact/stateHandlers.js` as `@qa-architect/pact-states`
 * and import from there — for now the duplication is documented and small.
 */
'use strict';

const STATES = Object.freeze({
  USER_1_EXISTS:           'user with ID 1 exists',
  USER_999_DOES_NOT_EXIST: 'user with ID 999 does not exist',
  AT_LEAST_ONE_USER:       'at least one user exists',
  EMAIL_AVAILABLE_CAROL:   'no user exists with email carol@example.com',
});

module.exports = { STATES };
