const { BadRequestError } = require('../errors');

const validateName = ( name ) => {
    if ( name.length < 3 )
        throw new BadRequestError(`Name length should be at least ${3}`);
    if ( name.length > 30)
        throw new BadRequestError(`Name length should be the most ${30}`);
    return name;
}

const validateLastName = ( lastName ) => {
    if (lastName.length > 30)
      throw new BadRequestError(`Last Name length should be the most ${30}`);
    return lastName;
}

const validateEmail = ( email ) => {
    const emailCheckRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if ( !email )
        throw new BadRequestError('Email can not be empty');
    if ( !emailCheckRegex.test(email) )
        throw new BadRequestError('Email should be valid');
    return email;
}

const validatePassword = ( passsword ) => {
    if (passsword.length < 6)
      throw new BadRequestError(`Password length should be at least ${6}`);
    return passsword;
}

const validateLocation = ( location ) => {
    if ( location && location.length > 30)
        throw new BadRequestError(`Location length should be the most ${30}`);
    return location;
}

const validateUserForRegister = ( user ) => {
    const name = validateName(user?.name || '');
    const lastName = user.lastName ? validateLastName(user.lastName) : null;
    const email = validateEmail(user.email);
    const password = validatePassword(user.password);

    return { name, lastName, email, password };
}

const validateUserForUpdate = ( user ) => {
    const name = validateName(user?.name || '');
    const lastName = user.lastName ? validateLastName(user.lastName) : null;
    const email = validateEmail(user.email);
    const location = validateLocation(user.location);

    return { name, lastName, email, location };
}

module.exports = {
  validateEmail,
  validateUserForRegister,
  validateUserForUpdate,
};