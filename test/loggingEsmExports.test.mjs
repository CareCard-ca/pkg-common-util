import * as assert from 'assert';
import { EventEmitter } from 'events';
import { describe, it } from 'mocha';
import {
  createApplicationLogger,
  createHttpRequestLogger,
  installFatalProcessLogging,
} from '../logging.mjs';

describe('application logging ESM exports', () => {
  it('records HTTP and fatal events through the ESM logging boundary', () => {
    const writes = [];
    const logger = createApplicationLogger({
      environment: 'test',
      service: 'esm-consumer',
      sink: (_destination, line) => writes.push(JSON.parse(line)),
      writeToConsole: false,
    });
    const response = new EventEmitter();
    response.statusCode = 200;
    let nextCalled = false;
    const httpLogger = createHttpRequestLogger(logger, { nowMilliseconds: () => 10 });

    httpLogger(
      { headers: {}, method: 'GET', originalUrl: '/health?secret=value', socket: {} },
      response,
      () => {
        nextCalled = true;
      },
    );
    response.emit('finish');

    const processTarget = new EventEmitter();
    const uninstall = installFatalProcessLogging(logger, { processTarget });
    processTarget.emit('uncaughtExceptionMonitor', new Error('fatal fixture'), 'uncaughtException');
    uninstall();

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(writes[0].operation, 'http.request.completed');
    assert.strictEqual(writes[0].http.route, '/health');
    assert.strictEqual(writes[1].operation, 'process.fatal');
    assert.strictEqual(processTarget.listenerCount('uncaughtExceptionMonitor'), 0);
  });
});
