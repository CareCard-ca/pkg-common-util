'use strict';

const assert = require('node:assert/strict');
const express = require('express');
const { describe, it } = require('mocha');
const { requestContext } = require('../index');
const { requestTestApplication } = require('./setup/requestTestApplication');

// Pattern: Application Composition - observes client identity through the public HTTP middleware contract.
function createTrustedClientApplication(trustedSubnet) {
  const application = express();
  application.set('trust proxy', trustedSubnet);
  application.use(requestContext);
  application.get('/', (request, response) => {
    response.json({ client: request.client, socketAddress: request.socket.remoteAddress });
  });
  return application;
}

describe('Trusted client address metadata', function () {
  for (const trustedSubnet of ['::ffff:10.0.0.0/8', '::/1']) {
    it(`keeps the untrusted socket address for ${trustedSubnet}`, async function () {
      const response = await requestTestApplication(
        createTrustedClientApplication(trustedSubnet),
        client => client.get('/').set('x-forwarded-for', '203.0.113.23'),
      );
      assert.equal(response.status, 200);
      assert.equal(response.body.client.ip, response.body.socketAddress);
      assert.notEqual(response.body.client.ip, '203.0.113.23');
    });
  }

  it('retains forwarded client metadata through a correctly trusted loopback subnet', async function () {
    const response = await requestTestApplication(
      createTrustedClientApplication('127.0.0.0/8'),
      client => client.get('/').set('x-forwarded-for', '203.0.113.23'),
    );
    assert.equal(response.status, 200);
    assert.equal(response.body.client.ip, '203.0.113.23');
  });
});
