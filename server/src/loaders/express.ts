
require('express-async-errors');

// events. can be separate file
import '../subscribers/user';

import { Container } from 'typedi';
// TODO: move to separate file: 'dependency-injectors'
Container.set('userModel', require('../models/User').default);
Container.set('jobModel', require('../models/Job').default);

import nodemailer from 'nodemailer';
import config from '../config';

Container.set('mailTransporter', nodemailer.createTransport(config.nodemailer));

import express from 'express';
const app = express();

import path from 'path';

// extra security packages
import helmet from 'helmet';

// const cors = require('cors');
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit');
const appLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    msg: 'Too many requests from this IP, try again later'
  }
});

// routers
import JobsRouter from '../api/routes/jobs/jobs.router';
const jobsRouterInstance = Container.get(JobsRouter);
import AuthRouter from '../api/routes/auth/auth.router';
const authRouterInstance = Container.get(AuthRouter);

// error handler
const notFoundMiddleware = require('../api/middlewares/not-found');
const errorHandlerMiddleware = require('../api/middlewares/error-handler');

app.set('trust proxy', 1); // for deploy
app.use(express.json());
app.use(helmet());
// app.use(cors());
app.use(xss());

app.use(express.static(path.resolve(__dirname, '../../client/dist')));
app.use(appLimiter);

// routes
authRouterInstance.addAuthRoutes(app);
jobsRouterInstance.addJobsRoutes(app);

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../client/dist', 'index.html'));
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export default app;