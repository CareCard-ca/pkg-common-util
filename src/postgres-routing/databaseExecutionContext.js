'use strict';

const { AsyncLocalStorage } = require('node:async_hooks');

const PRIMARY_WRITE_ROLE = 'primary-write';
const REPLICA_READ_ROLE = 'replica-read';

// Pattern: Scoped Context - owns database intent for one asynchronous execution boundary.
function createDatabaseExecutionContext() {
  const storage = new AsyncLocalStorage();
  return {
    getRole: () => getExecutionRole(storage),
    markPrimaryRequired: () => markPrimaryRequired(storage),
    runPrimaryWrite: operation => runPrimaryWrite(storage, operation),
    runReplicaRead: operation => runReplicaRead(storage, operation),
  };
}

// Pattern: Fail-Safe Default - routes missing or sticky intent to the writable primary.
function getExecutionRole(storage) {
  const state = storage.getStore();
  return !state || state.primaryRequired ? PRIMARY_WRITE_ROLE : state.preferredRole;
}

// Pattern: Consistency Guard - makes the current execution boundary sticky to the primary.
function markPrimaryRequired(storage) {
  const state = storage.getStore();
  if (state) {
    state.primaryRequired = true;
  }
}

// Pattern: Intention-Revealing Interface - declares replica-tolerant work without downgrading primary work.
function runReplicaRead(storage, operation) {
  validateOperation(operation);
  const currentState = storage.getStore();
  if (currentState?.primaryRequired || currentState?.preferredRole === PRIMARY_WRITE_ROLE) {
    return operation();
  }
  return storage.run(createExecutionState(REPLICA_READ_ROLE), operation);
}

// Pattern: Consistency Boundary - marks nested and subsequent work primary-required.
function runPrimaryWrite(storage, operation) {
  validateOperation(operation);
  const currentState = storage.getStore();
  if (currentState) {
    currentState.primaryRequired = true;
    return operation();
  }
  return storage.run(createExecutionState(PRIMARY_WRITE_ROLE), operation);
}

// Pattern: State Factory - creates one mutable request-local consistency marker.
function createExecutionState(preferredRole) {
  return { preferredRole, primaryRequired: preferredRole === PRIMARY_WRITE_ROLE };
}

// Pattern: Guard Clause - rejects non-callable database operations before context mutation.
function validateOperation(operation) {
  if (typeof operation !== 'function') {
    throw new TypeError('Database operation must be a function');
  }
}

module.exports = {
  PRIMARY_WRITE_ROLE,
  REPLICA_READ_ROLE,
  createDatabaseExecutionContext,
};
