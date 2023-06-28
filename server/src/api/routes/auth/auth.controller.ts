const { StatusCodes } = require('http-status-codes');

import UserValidator from '../../validators/user';
import { IUserForRegisterDTO, IUserForUpdateDTO } from '../../../interfaces/user-inputs/IUsers';
import { Request, Response } from 'express';
import IAuthRequest from '../../../interfaces/IAuthRequest';
import AuthService from '../../../services/auth';
import Container, { Service, Inject } from 'typedi';

@Service()
export default class AuthController {
  @Inject() authService: AuthService;
  @Inject() userValidator: UserValidator;

  constructor(
    @Inject() authService: AuthService,
    @Inject() userValidator: UserValidator
  ) {
    this.authService = authService;
    this.userValidator = userValidator;
  }

  register = async (req: Request, res: Response): Promise<void> => {
    const validatedUser = this.userValidator.validateUserForRegister(
      req.body as IUserForRegisterDTO
    );
    const user = await this.authService.register(validatedUser);
    res.status(StatusCodes.CREATED).json({ user });
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const email = this.userValidator.validateEmail(req.body.email);
    const user = await this.authService.login(email, req.body.password);
    res.status(StatusCodes.OK).json({ user });
  };

  update = async (req: IAuthRequest, res: Response): Promise<void> => {
    const userId = req.user ? req.user.id : '';
    const validatedUser = this.userValidator.validateUserForUpdate(
      req.body as IUserForUpdateDTO
    );
    const user = await this.authService.update(userId, validatedUser);
    res.status(StatusCodes.OK).json({ user });
  };
}