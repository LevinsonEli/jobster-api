const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError } = require('../errors')
const {
  validateEmail,
  validateUserForRegister,
  validateUserForUpdate,
} = require('../validators/user');
const { createJWT } = require('../utils/jwt');

const register = async (req, res) => {
  const validatedUser = validateUserForRegister(req.body);
  const user = await User.create({ ...validatedUser });
  const jwtPayload = user.createPayloadForJWT();
  const token = createJWT(jwtPayload);
  res
    .status(StatusCodes.CREATED)
    .json({
      user: {
        name: user.name,
        lastName: user.lastName,
        location: user.location,
        email: user.email,
        token,
      },
    });
}

const login = async (req, res) => {
  const email = validateEmail(req.body.email);
  const password = req.body.password;

  const user = await User.findOne({ email })
  if (!user) {
    throw new UnauthenticatedError('Invalid Credentials')
  }
  const isPasswordCorrect = await user.comparePassword(password)
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid Credentials')
  }
  const jwtPayload = user.createPayloadForJWT();
  const token = createJWT(jwtPayload);
  res
    .status(StatusCodes.OK)
    .json({
      user: {
        email: user.email,
        lastName: user.lastName,
        location: user.location,
        name: user.name,
        token,
      },
    });
}

const updateUser = async (req, res) => {
  const validatedUser = validateUserForUpdate(req.body);

  const user = await User.findOne({ _id: req.user.id });
  
  user.email = validatedUser.email;
  user.name = validatedUser.name;
  user.lastName = validatedUser.lastName;

  await user.save();
  const jwtPayload = user.createPayloadForJWT();
  const token = createJWT(jwtPayload);
  res.status(StatusCodes.OK).json({
    user: {
      email: user.email,
      lastName: user.lastName,
      location: user.location,
      name: user.name,
      token,
    },
  });
}

module.exports = {
  register,
  login,
  updateUser,
};
