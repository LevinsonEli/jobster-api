const ObjectId = require('mongoose').Types.ObjectId;

export default function validateId ( id: string ) {
  if (ObjectId.isValid(id) && String(new ObjectId(id)) === id) 
    return true;
  return false;
};