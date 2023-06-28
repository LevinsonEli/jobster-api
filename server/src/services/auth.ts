import RegisterUserValidatedInput from '../types/users/RegisterUserValidatedInput';
import UpdateUserValidatedInput from '../types/users/UpdateUserValidatedInput';

import User from '../models/User';
import IJWTPayload from '../interfaces/IJWTPayload';
import { Model } from 'mongoose';
import IUser from '../interfaces/IUser';
import { Service, Inject } from 'typedi';
import {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} from '../api/errors';
import {
  EventDispatcher,
  EventDispatcherInterface,
} from '../decorators/event-dispatcher';
import events from '../subscribers/events';
import UsersService from './user';
import config from '../config';
const jwt = require('jsonwebtoken');
import IAuthUser from '@/interfaces/IAuthUser';
import MailerService from './mailer';

@Service()
export default class AuthService {
  @Inject() usersService: UsersService;
  @EventDispatcher() private eventDispatcher: EventDispatcherInterface;
  @Inject() private mailerInstance: MailerService;
  constructor(
    @Inject() usersService: UsersService,
    @EventDispatcher() eventDispatcher: EventDispatcherInterface,
    @Inject() mailerInstance: MailerService
  ) {
    this.usersService = usersService;
    this.eventDispatcher = eventDispatcher;
    this.mailerInstance = mailerInstance;
  }

  public register = async (
    data: RegisterUserValidatedInput
  ): Promise<IAuthUser> => {
    const isEmailExist = await this.usersService.getOneByEmail(data.email);
    if (isEmailExist) throw new BadRequestError('Such a user already exist');
    const user = await this.usersService.create({ ...data });

    console.log(this.mailerInstance);
    this.eventDispatcher.dispatch(events.user.register, {
      user: user as IUser,
      mailerInstance: this.mailerInstance,
    });

    const jwtPayload = this.createPayloadForJWT(user);
    const token = this.createJWT(jwtPayload);

    return this.convertIUserToIAuthUser(user, token);
  };

  public login = async (
    email: string,
    password: string
  ): Promise<IAuthUser> => {
    const user = await this.validateCredentials(email, password);

    this.eventDispatcher.dispatch(events.user.login, {
      user: user as IUser,
      mailerInstance: this.mailerInstance,
    });

    const jwtPayload = this.createPayloadForJWT(user);
    const token = this.createJWT(jwtPayload);

    return this.convertIUserToIAuthUser(user, token);
  };

  public async update(
    id: string,
    data: UpdateUserValidatedInput
  ): Promise<IAuthUser> {
    const user = await this.usersService.updateOne(id, data);
    const jwtPayload = this.createPayloadForJWT(user);
    const token = this.createJWT(jwtPayload);
    return this.convertIUserToIAuthUser(user, token);
  }

  private createJWT = (payload: IJWTPayload): string => {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtLifetime,
    });
  };

  private createPayloadForJWT(user: {
    _id: string;
    name: string;
  }): IJWTPayload {
    return {
      id: user._id,
      name: user.name,
    };
  }

  public async validateCredentials(
    email: string,
    password: string
  ): Promise<IUser> {
    try {
      const user = await this.usersService.getOneByEmail(email);
      if (!user) throw new UnauthenticatedError('Invalid Credentials');
      const isPasswordCorrect = await user.comparePassword(password);
      if (!isPasswordCorrect)
        throw new UnauthenticatedError('Invalid Credentials');
      return user;
    } catch (err) {
      throw new BadRequestError('Failed to validate credentials.');
    }
  }

  private convertIUserToIAuthUser = (user: IUser, token: string): IAuthUser => {
    return {
      _id: user._id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      location: user.location,
      token,
    } as IAuthUser;
  };
}
