const ObjectId = require('mongoose').Types.ObjectId;

const validateId = ( id ) => {
  if (ObjectId.isValid(id) && String(new ObjectId(id)) === id) 
    return true;
  return false;
};

module.exports = {
  validateId,
};
