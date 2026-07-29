'use strict';

// Pattern: Observer - records fatal errors through the monitor event without changing crash behavior.
function installFatalProcessLogging(logger, options = {}) {
  const processTarget = options.processTarget || process;
  const monitorFatalError = (error, origin) => {
    logger.error('Fatal process error observed', {
      error,
      operation: 'process.fatal',
      origin
    });
  };
  processTarget.on('uncaughtExceptionMonitor', monitorFatalError);
  return () => processTarget.off('uncaughtExceptionMonitor', monitorFatalError);
}

module.exports = installFatalProcessLogging;
