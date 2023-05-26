

const validateName = ( name ) => {
    if ( name.length < 3 )
        throw new Error(`Name length should be at least ${3}`);
    if ( name.length > 30)
        throw new Error(`Name length should be the most ${30}`);
    return name;
}

const validateLastName = ( lastName ) => {
    if (lastName.length > 30)
      throw new Error(`Last Name length should be the most ${30}`);
    return lastName;
}

const validateEmail = ( email ) => {
    //validate
    return email;
}

const validatePassword = ( passsword ) => {
    if (passsword.length < 6)
      throw new Error(`Password length should be at least ${6}`);
    return passsword;
}

const validateUserForRegister = ( user ) => {
    const name = validateName(user?.name || '');
    const lastName = user.lastName ? validateLastName(lastName) : null;
    const email = validateEmail(user.email);
    const password = validatePassword(user.password);

    return { name, lastName, email, password };
}

const validateUserForUpdate = ( user ) => {
    const name = validateName(user?.name || '');
    const lastName = user.lastName ? validateLastName(lastName) : null;
    const email = validateEmail(user.email);

    return { name, lastName, email };
}


module.exports = {
  validateEmail,
  validateUserForRegister,
  validateUserForUpdate,
};