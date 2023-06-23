const { BadRequestError } = require('../errors');

import {
  IUserForRegisterDTO,
  IUserForUpdateDTO,
} from '../../interfaces/user-inputs/IUsers';
import RegisterUserValidatedInput from '../../types/users/RegisterUserValidatedInput';
import UpdateUserValidatedInput from '../../types/users/UpdateUserValidatedInput';

export default class UserValidator {
  private static instance: UserValidator;
  private constructor() {}

  public static getInstance(): UserValidator {
    if (!UserValidator.instance) {
      UserValidator.instance = new UserValidator();
    }
    return UserValidator.instance;
  }

  public validateName = (name: string): string => {
    if (name.length < 3)
      throw new BadRequestError(`Name length should be at least ${3}`);
    if (name.length > 30)
      throw new BadRequestError(`Name length should be the most ${30}`);
    return name;
  };

  public validateLastName = (lastName: string): string => {
    if (lastName.length > 30)
      throw new BadRequestError(`Last Name length should be the most ${30}`);
    return lastName;
  };

  public validateEmail = (email: string): string => {
    const emailCheckRegex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!email) throw new BadRequestError('Email can not be empty');
    if (!emailCheckRegex.test(email))
      throw new BadRequestError('Email should be valid');
    return email;
  };

  public validatePassword = (passsword: string): string => {
    if (passsword.length < 6)
      throw new BadRequestError(`Password length should be at least ${6}`);
    return passsword;
  };

  public validateLocation = (location: string): string => {
    if (location && location.length > 30)
      throw new BadRequestError(`Location length should be the most ${30}`);
    return location;
  };

  public validateUserForRegister = (user: IUserForRegisterDTO): RegisterUserValidatedInput => {
    const name = this.validateName(user?.name || '');
    const lastName = user.lastName
      ? this.validateLastName(user.lastName)
      : null;
    const email = this.validateEmail(user.email);
    const password = this.validatePassword(user.password);

    return { name, lastName, email, password } as RegisterUserValidatedInput;
  };

  public validateUserForUpdate = (user: IUserForUpdateDTO): UpdateUserValidatedInput => {
    const name = this.validateName(user?.name || '');
    const lastName = user.lastName
      ? this.validateLastName(user.lastName)
      : null;
    const email = this.validateEmail(user.email);
    const location = this.validateLocation(user.location);

    return { name, lastName, email, location } as UpdateUserValidatedInput;
  };
}