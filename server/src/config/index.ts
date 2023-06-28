const dotenv = require('dotenv');
import { Secret } from 'jsonwebtoken';
import nodemailer from './nodemailer';
import { TransportOptions } from 'nodemailer';

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config({ path: __dirname + '../../.env' });
if (envFound.error) {
  // This error should crash whole process

  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

export default {
  port: parseInt(process?.env.PORT || '5000', 10),

  databaseURL: process.env.MONGO_URI || 'mongodb://localhost:27017/jobster-api',

  jwtSecret: process.env.JWT_SECRET as Secret,
  jwtLifetime: process.env.JWT_LIFETIME,

  api: {
    prefix: '/api/v1',
  },

  nodemailer: {
    host: process.env.NODEMAILER_HOST,
    port: Number(process.env.NODEMAILER_PORT),
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  } as TransportOptions,
};
