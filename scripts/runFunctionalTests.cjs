'use strict';

const { runIndexedMochaTests } = require('./testParallel/runIndexedMochaTests.cjs');

const parallelTestFiles = [
  'test/appErrorHandlers.test.js',
  'test/applicationLogging.test.js',
  'test/errorUtils.test.js',
  'test/keysCaseConverter.test.js',
  'test/responseStatus.test.js',
  'test/standardResponse.test.js',
  'test/traceContext.test.js',
  'test/openTelemetryBridge.test.js',
  'test/utilityFunctions.test.js'
];

if (require.main === module) {
  runIndexedMochaTests(parallelTestFiles)
    .then((exitCode) => {
      process.exitCode = exitCode;
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}

module.exports = { parallelTestFiles };
