const { BadRequestError } = require('../errors');
import { Request, Response, NextFunction } from 'express';
import IAuthRequest from '../../interfaces/IAuthRequest';

const testUser = (req: IAuthRequest, res: Response, next: NextFunction) => {
  const isTestUser = req.user ? req.user.testUser : false;
  if (isTestUser) {
    throw new BadRequestError('Test User. Read Only');
  }
  next();
};

export default testUser;
