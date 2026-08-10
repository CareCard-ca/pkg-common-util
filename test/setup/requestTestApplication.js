'use strict';

const request = require('supertest');
const { createManagedHttpTestServer } = require('./managedHttpTestServer');

// Pattern: Resource Scope - owns one explicitly bound server for the complete HTTP request lifecycle.
async function requestTestApplication(application, configureRequest) {
  const managedServer = createManagedHttpTestServer(application);
  await managedServer.start();

  try {
    return await configureRequest(request(managedServer.getServer()));
  } finally {
    await managedServer.stop();
  }
}

module.exports = {
  requestTestApplication
};
