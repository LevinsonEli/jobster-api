import RegisterUserValidatedInput from '../types/users/RegisterUserValidatedInput';
import UpdateUserValidatedInput from '../types/users/UpdateUserValidatedInput';

import User from '../models/User';
import IJWTPayload from '../interfaces/IJWTPayload';
import { Model } from 'mongoose';
import IUser from '../interfaces/IUser';
import { Service, Inject } from 'typedi';
import { BadRequestError, NotFoundError, UnauthenticatedError } from '../api/errors';
import {
  EventDispatcher,
  EventDispatcherInterface,
} from '../decorators/event-dispatcher';
import events from '../subscribers/events';

@Service()
export default class UsersService {
  @Inject('userModel') userModel: Model<IUser & Document>;
  @EventDispatcher() private eventDispatcher: EventDispatcherInterface;
  constructor(
    @Inject('userModel') userModel: Model<IUser & Document>,
    @EventDispatcher() eventDispatcher: EventDispatcherInterface
  ) {
    this.userModel = userModel;
    this.eventDispatcher = eventDispatcher;
  }

  public async create(data: RegisterUserValidatedInput): Promise<IUser> {
    try {
      const user = await this.userModel.create({ ...data });
      return user;
    } catch (err) {
      throw new BadRequestError('Failed to create the user.');
    }
  }

  // return user or null if not found
  public async getOne(id: string): Promise<IUser | null> {
    const user = await User.findOne({ _id: id });
    return user;
  }

  // return user or null if not found
  public async getOneByEmail(email: string): Promise<IUser | null> {
    const user = await this.userModel.findOne({ email });
    return user;
  }

  public async updateOne(
    id: string,
    data: UpdateUserValidatedInput
  ): Promise<IUser> {
    try {
      const user = await this.userModel.findOne({ _id: id });
      if (!user) throw new Error('User not found');

      user.name = data.name || user.name;
      user.lastName = data.lastName || user.lastName;
      // user.email = data.email || user.email; // TODO: separate email update
      user.location = data.location || user.location;

      const updatedUser = await user.save();
      return updatedUser;
    } catch (err) {
      throw new BadRequestError('Failed to create the user.');
    }
  }
}
