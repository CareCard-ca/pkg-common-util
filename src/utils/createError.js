/**
 * Helper for standardized errors.
 * 
 * @param {Object} params
 * @param {string} params.code
 * @param {string} [params.details]
 * @param {Record<string, string>} [params.fields]
 * @returns {Object} Standardized error object
 */
const createError = ({ code, details, fields }) => {
  return {
    code,
    details,
    fields
  };
};

module.exports = createError;
