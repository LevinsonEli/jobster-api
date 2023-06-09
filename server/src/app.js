require('dotenv').config();
require('express-async-errors');

const path = require('path');

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

const express = require('express');
const app = express();

const connectDB = require('./db/connect');
const authenticateUser = require('./middleware/authentication');
// routers
const authRouter = require('./routers/auth/auth.router');
const jobsRouter = require('./routers/jobs/jobs.router');
// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.set('trust proxy', 1); // for deploy
app.use(express.json());
app.use(helmet());
// app.use(cors());
app.use(xss());

if (process.env.NODE_ENV === 'DEV')
  app.use(express.static(path.resolve(__dirname, '../../client')));
else
  app.use(express.static(path.resolve(__dirname, '../client/dist')));
app.use(appLimiter);

// routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authenticateUser, jobsRouter);

app.get('*', (req, res) => {
  if (process.env.NODE_ENV === 'DEV')
    res.sendFile(path.resolve(__dirname, '../../client', 'index.html'));
  else
    res.sendFile(path.resolve(__dirname, '../../client/dist', 'index.html'));
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
