/**
 * Helper for standardized errors.
 * 
 * @param {Object} params
 * @param {string} params.code
 * @param {string} [params.details]
 * @param {string} [params.message]
 * @param {Record<string, string>} [params.fields]
 * @returns {Object} Standardized error object
 */
const createError = ({ code, details, message, fields }) => {
  return {
    code,
    details,
    message,
    fields
  };
};

module.exports = createError;
