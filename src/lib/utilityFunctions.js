// Create new object only with properties given in array.
function extractObjectWithProperties(obj, arrayOfProperties) {
  const returnObj = {};

  if (!obj || !Array.isArray(arrayOfProperties)) {
    return returnObj;
  }

  arrayOfProperties.forEach(nameOfProperty => {
    if (Object.prototype.hasOwnProperty.call(obj, nameOfProperty)) {
      returnObj[nameOfProperty] = obj[nameOfProperty];
    }
  });

  return returnObj;
}

module.exports = {
  extractObjectWithProperties,
};
