export default interface IUser {
  _id: string;
  name: string;
  lastName: string;
  location: string;
  email: string;
  password: string;
  comparePassword(canditatePassword: string): Promise<boolean>;
}