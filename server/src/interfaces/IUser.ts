import { Document } from 'mongoose';

export default interface IUser extends Document {
  _id: string;
  name: string;
  lastName: string;
  location: string;
  email: string;
  password: string;
  comparePassword(canditatePassword: string): Promise<boolean>;
}