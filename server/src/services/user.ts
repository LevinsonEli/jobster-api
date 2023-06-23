import RegisterUserValidatedInput from '../types/users/RegisterUserValidatedInput';
import UpdateUserValidatedInput from '../types/users/UpdateUserValidatedInput';

import User from '../models/User';
import IJWTPayload from '../interfaces/IJWTPayload';
import { Model } from 'mongoose';
import IUser from '../interfaces/IUser';
import { Service, Inject } from 'typedi';
import { BadRequestError, NotFoundError, UnauthenticatedError } from '../api/errors';

@Service()
export default class UsersService {
  @Inject('userModel') userModel: Model<IUser & Document>;
  constructor(@Inject('userModel') userModel: Model<IUser & Document>) {
    this.userModel = userModel;
  }

  public async create(data: RegisterUserValidatedInput): Promise<IUser> {
    try {
      const user = await this.userModel.create({ ...data });
      return user;
    } catch (err) {
      throw new BadRequestError('Failed to create the user.');
    }
  }

  public async getOne(id: string): Promise<IUser> {
    try {
      const user = await User.findOne({ _id: id });
      if (!user) throw new NotFoundError('User not found.');
      return user;
    } catch (err) {
      throw new NotFoundError('User not found.');
    }
  }

  public async getOneByEmail(email: string): Promise<IUser> {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) throw new NotFoundError('User not found.');
      return user;
    } catch (err) {
      throw new NotFoundError('User not found.');
    }
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
      user.location = data.location || user.location;

      const updatedUser = await user.save();
      return updatedUser;
    } catch (err) {
      throw new BadRequestError('Failed to create the user.');
    }
  }

  public async validateCredentials(
    email: string,
    password: string
  ): Promise<IUser> {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) throw new UnauthenticatedError('Invalid Credentials');
      const isPasswordCorrect = await user.comparePassword(password);
      if (!isPasswordCorrect) throw new UnauthenticatedError('Invalid Credentials');
      return user;
    } catch (err) {
      throw new BadRequestError('Failed to validate credentials.');
    }
  }

  public createPayloadForJWT(user: { _id: string; name: string }): IJWTPayload {
    return {
      id: user._id,
      name: user.name,
    };
  }
}
