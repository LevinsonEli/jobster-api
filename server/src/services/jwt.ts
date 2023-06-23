import config from '../config';
import IJWTPayload from '../interfaces/IJWTPayload';
const jwt = require('jsonwebtoken');

const createJWT = (payload: IJWTPayload): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtLifetime,
  });
};

module.exports = {
  createJWT,
};
