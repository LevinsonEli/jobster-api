const User = require('../../../models/User');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../../errors');
const { createJWT } = require('../../../services/jwt');

import UserValidator from '../../validators/user';
import { IUserForRegisterDTO, IUserForUpdateDTO } from '../../../interfaces/user-inputs/IUsers';
import { Request, Response } from 'express';
import IAuthRequest from '../../../interfaces/IAuthRequest';
import UsersService from '../../../services/user';

export default class AuthController {
  private static instance: AuthController;
  private constructor() {}

  public static getInstance(): AuthController {
    if (!AuthController.instance) {
      AuthController.instance = new AuthController();
    }
    return AuthController.instance;
  }

  public async register (req: Request, res: Response) {
    const validatedUser = UserValidator.getInstance().validateUserForRegister(
      req.body as IUserForRegisterDTO
    );
    const isEmailExist = await UsersService.getInstance().getOneByEmail(validatedUser.email);
    if (isEmailExist) throw new BadRequestError('Such a user already exist');
    const user = await UsersService.getInstance().create({ ...validatedUser });
    const jwtPayload = UsersService.getInstance().createPayloadForJWT(user);
    const token = createJWT(jwtPayload);
    res.status(StatusCodes.CREATED).json({
      user: {
        name: user.name,
        lastName: user.lastName,
        location: user.location,
        email: user.email,
        token,
      },
    });
  };

  public async login (req: Request, res: Response) {
    const email = UserValidator.getInstance().validateEmail(req.body.email);
    const user = await UsersService.getInstance().validateCredentials(email, req.body.password);

    const jwtPayload = UsersService.getInstance().createPayloadForJWT(user);
    const token = createJWT(jwtPayload);
    res.status(StatusCodes.OK).json({
      user: {
        email: user.email,
        lastName: user.lastName,
        location: user.location,
        name: user.name,
        token,
      },
    });
  };

  public async updateUser (req: IAuthRequest, res: Response) {
    const userId = req.user ? req.user.id : '';
    const validatedUser = UserValidator.getInstance().validateUserForUpdate(
      req.body as IUserForUpdateDTO
    );
    const user = await UsersService.getInstance().updateOne(userId, validatedUser);

    const jwtPayload = UsersService.getInstance().createPayloadForJWT(user);
    const token = createJWT(jwtPayload);
    res.status(StatusCodes.OK).json({
      user: {
        email: user.email,
        lastName: user.lastName,
        location: user.location,
        name: user.name,
        token,
      },
    });
  };
}
