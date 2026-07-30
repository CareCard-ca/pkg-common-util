'use strict';

const createApplicationLogger = require('./createApplicationLogger');
const createHttpRequestLogger = require('./createHttpRequestLogger');
const installFatalProcessLogging = require('./installFatalProcessLogging');

module.exports = {
  createApplicationLogger,
  createHttpRequestLogger,
  installFatalProcessLogging
};
