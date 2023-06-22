import config from '../../config';
import { Response, NextFunction } from "express";
import IAuthRequest from '../../interfaces/IAuthRequest';

import jwt from 'jsonwebtoken';
import IJWTPayload from '../../interfaces/IJWTPayload';
import Container from 'typedi';
import UsersService from '../../services/user';
const { UnauthenticatedError } = require('../errors');

const auth = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  // check header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    throw new UnauthenticatedError('Authentication invalid');
  }
  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, config.jwtSecret) as IJWTPayload;
    // Check if user exist
    const usersServiceInstance = Container.get(UsersService);
    const userExist = usersServiceInstance.getOne(payload.id);
    if (!userExist) throw new UnauthenticatedError('Authentication failed');
    // For test user
    const testUser = payload.id === '647113cfc9f106526863c154';
    req.user = { id: payload.id, testUser };
    next();
  } catch (error) {
    throw new UnauthenticatedError('Authentication invalid');
  }
};

export default auth;
