const User = require('../../models/User');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../../errors');
const {
  validateEmail,
  validateUserForRegister,
  validateUserForUpdate,
} = require('../../validators/user');
const { createJWT } = require('../../utils/jwt');
const {
  create,
  getOne,
  getOneByEmail,
  updateOne,
  validateCredentials,
  createPayloadForJWT,
} = require('../../db/controllers/user');

const register = async (req, res) => {
  const validatedUser = validateUserForRegister(req.body);
  const isEmailExist = await getOneByEmail({ email: validatedUser.email });
  if (isEmailExist) 
    throw new BadRequestError('Such a user already exist');
  const user = await create({ ...validatedUser });
  const jwtPayload = createPayloadForJWT(user);
  const token = createJWT(jwtPayload);
  res.status(StatusCodes.CREATED).json({
    user: {
      name: user.name,
      lastName: user.lastName,
      location: user.location,
      email: user.email,
      token,
    },
  });
};

const login = async (req, res) => {
  const email = validateEmail(req.body.email);
  const user = await validateCredentials(email, req.body.password);

  const jwtPayload = createPayloadForJWT(user);
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
};

const updateUser = async (req, res) => {
  const validatedUser = validateUserForUpdate(req.body);
  const user = updateOne(req.user.id, validatedUser);

  const jwtPayload = createPayloadForJWT(user);
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
};

module.exports = {
  register,
  login,
  updateUser,
};
