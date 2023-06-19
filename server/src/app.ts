require('express-async-errors');
import config from './config';

import app from './loaders/express';
import connectDB from './loaders/db/connect';

const start = async () => {
  try {
    await connectDB(config.databaseURL);
    app.listen(config.port, () =>
      console.log(`Server is listening on port ${config.port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
