const getUuid = () => {
  try {
    const crypto = require('crypto');
    if (crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return '00000000-0000-0000-0000-000000000000';
  } catch (e) {
    return '00000000-0000-0000-0000-000000000000';
  }
};

/**
 * Express middleware to generate and attach request context.
 *
 * Generates requestId (UUID v4)
 * Reads traceId from header 'x-trace-id' OR generates one
 * Reads appId from header 'x-app-id'
 * Extracts client IP
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const requestContext = (req, res, next) => {
  const requestId = getUuid();
  req.requestId = requestId;
  req.traceId = req.headers['x-trace-id'] || requestId;

  const appId = req.headers['x-app-id'];
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  req.client = {
    appId,
    ip
  };

  next();
};

module.exports = requestContext;
