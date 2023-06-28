import { Document } from 'mongoose';

export default interface IUser extends Document {
  _id: string;
  name: string;
  lastName: string;
  location: string;
  email: string;
  password?: string; // TODO ?
  comparePassword(canditatePassword: string): Promise<boolean>;
}