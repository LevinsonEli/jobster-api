
require('express-async-errors');

import express from 'express';
const app = express();

const path = require('path');
// const express = require('express');

// extra security packages
const helmet = require('helmet');
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

import authenticateUser from '../api/middlewares/authentication';
// routers
import authRouter from '../api/routes/auth/auth.router';
import jobsRouter from '../api/routes/jobs/jobs.router';
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
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authenticateUser, jobsRouter);

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../client/dist', 'index.html'));
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export default app;