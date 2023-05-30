const User = require('../../models/User');
const { BadRequestError } = require('../../errors');

const create = async (data) => {
  try {
    const user = await User.create({ ...data });
    return user; // TODO: more control
  } catch (error) {
    throw new BadRequestError(
      'Error occured while creating new user.'
    );
  }
};

const getOne = async (id) => {
  const user = await User.findOne({ _id: id });
  return user; // TODO: more control
};

const getOneByEmail = async (email) => {
  const user = await User.findOne({ email });
  return user; // TODO: more control
};

const updateOne = async (id, data) => {
  try {
    const user = await User.findOne({ _id: id });

    user.name = data.name || user.name;
    user.lastName = data.lastName || user.lastName;
    user.location = data.location || user.location;

    const updatedUser = await user.save();
    return updatedUser; // TODO: more control
  } catch (error) {
    throw new BadRequestError(
      'Error occured while updating user.'
    );
  }
};

const validateCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new UnauthenticatedError('Invalid Credentials');
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) throw new UnauthenticatedError('Invalid Credentials');
  return user;
};

const createPayloadForJWT = (user) => {
  return {
    id: user._id,
    name: user.name,
  };
};

module.exports = {
  create,
  getOne,
  getOneByEmail,
  updateOne,
  validateCredentials,
  createPayloadForJWT,
};
