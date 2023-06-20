import RegisterUserValidatedInput from '../types/users/RegisterUserValidatedInput';
import UpdateUserValidatedInput from '../types/users/UpdateUserValidatedInput';

import User from '../models/User';
import IJWTPayload from '../interfaces/IJWTPayload';
import { Model } from 'mongoose';
import IUser from '../interfaces/IUser';
import { Service, Inject } from 'typedi';

@Service()
export default class UsersService {
  @Inject('userModel') userModel: Model<IUser & Document>;
  constructor(@Inject('userModel') userModel: Model<IUser & Document>) {
    this.userModel = userModel;
  }

  public async create(data: RegisterUserValidatedInput) {
    const user = await this.userModel.create({ ...data });
    return user; // TODO: more control
  }

  public async getOne(id: string) {
    const user = await User.findOne({ _id: id });
    return user; // TODO: more control
  }

  public async getOneByEmail(email: string) {
    const user = await this.userModel.findOne({ email });
    return user; // TODO: more control
  }

  public async updateOne(id: string, data: UpdateUserValidatedInput) {
    const user = await this.userModel.findOne({ _id: id });
    if (user) {
      user.name = data.name || user.name;
      user.lastName = data.lastName || user.lastName;
      user.location = data.location || user.location;

      const updatedUser = await user.save();
      return updatedUser; // TODO: more control: as IUser
    } else {
      throw new Error('User not found');
    }
  }

  public async validateCredentials(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new Error('Invalid Credentials');
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) throw new Error('Invalid Credentials');
    return user;
  }

  public createPayloadForJWT(user: { _id: string; name: string }): IJWTPayload {
    return {
      id: user._id,
      name: user.name,
    };
  }
}
