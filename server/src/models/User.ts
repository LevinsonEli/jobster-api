const mongoose = require('mongoose')
import config from '../config';
import IJWTPayload from '../interfaces/IJWTPayload';
const bcrypt = require('bcryptjs')
import IUser from '../interfaces/IUser';
import { Schema, model } from 'mongoose';
const jwt = require('jsonwebtoken');

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Please provide name'],
    maxlength: 50,
    minlength: 3,
  },
  lastName: {
    type: String,
    trim: true,
    maxLength: 30,
    default: 'Last Name',
  },
  location: {
    type: String,
    maxLength: 30,
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email',
    ],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 6,
  },
});

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.createJWT = function () {
  return jwt.sign(
    { userId: this._id, name: this.name },
    config.jwtSecret,
    {
      expiresIn: config.jwtLifetime,
    }
  )
}

UserSchema.methods.createPayloadForJWT = function (): IJWTPayload {
  return {
    id: this._id,
    name: this.name,
  }
}

UserSchema.methods.comparePassword = async function (canditatePassword) {
  const isMatch = await bcrypt.compare(canditatePassword, this.password)
  return isMatch
}

// module.exports = mongoose.model('User', UserSchema)

export default model<IUser & Document>('User', UserSchema);
