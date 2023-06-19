require('dotenv').config();

const mockData = require('../../mock-data.json');
const Job = require('../models/Job');
import connectDB from './connect';
import config from '../../config';

const start = async () => {
  try {
    await connectDB(config.databaseURL);
    await Job.create(mockData);
    console.log('Successfully populated the DB');
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

start();
