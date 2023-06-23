const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../../errors');
const { createJWT } = require('../../../services/jwt');

import UserValidator from '../../validators/user';
import { IUserForRegisterDTO, IUserForUpdateDTO } from '../../../interfaces/user-inputs/IUsers';
import { Request, Response } from 'express';
import IAuthRequest from '../../../interfaces/IAuthRequest';
import UsersService from '../../../services/user';
import { Service, Inject } from 'typedi';

@Service()
export default class AuthController {
  @Inject() userService: UsersService;

  constructor(@Inject() userService: UsersService) {
    this.userService = userService;
  }

  register = async (req: Request, res: Response): Promise<void> => {
    const validatedUser = UserValidator.getInstance().validateUserForRegister(
      req.body as IUserForRegisterDTO
    );
    const isEmailExist = await this.userService.getOneByEmail(
      validatedUser.email
    );
    if (isEmailExist) throw new BadRequestError('Such a user already exist');
    const user = await this.userService.create({ ...validatedUser });
    const jwtPayload = this.userService.createPayloadForJWT(user);
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

  login = async (req: Request, res: Response): Promise<void> => {
    const email = UserValidator.getInstance().validateEmail(req.body.email);
    const user = await this.userService.validateCredentials(
      email,
      req.body.password
    );

    const jwtPayload = this.userService.createPayloadForJWT(user);
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

  updateUser = async (req: IAuthRequest, res: Response): Promise<void> => {
    const userId = req.user ? req.user.id : '';
    const validatedUser = UserValidator.getInstance().validateUserForUpdate(
      req.body as IUserForUpdateDTO
    );
    const user = await this.userService.updateOne(userId, validatedUser);

    const jwtPayload = this.userService.createPayloadForJWT(user);
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