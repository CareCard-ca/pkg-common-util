'use strict';

const { runIndexedMochaTests } = require('../scripts/testParallel/runIndexedMochaTests.cjs');

const parallelTestFiles = [
  'test/appErrorHandlers.test.js',
  'test/config/repositoryIsolation.test.js',
  'test/config/tddGuidanceDocs.test.js',
  'test/errorUtils.test.js',
  'test/keysCaseConverter.test.js',
  'test/requestContext_fallback.test.js',
  'test/responseStatus.test.js',
  'test/srcIndex.test.js',
  'test/standardResponse.test.js',
  'test/traceContext.test.js',
  'test/traceDocumentation.test.js',
  'test/traceEsmExports.test.mjs',
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
