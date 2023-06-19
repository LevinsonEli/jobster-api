require('dotenv').config();

const mockData = require('../../mock-data.json');
const Job = require('../models/Job');
import connectDB from './connect';

const start = async () => {
  try {
    await connectDB(
      'mongodb+srv://mongoDBuser:123petrol321mong@nodeexpressprojects.7kp2d.mongodb.net/jobster-manager-tutorial?retryWrites=true&w=majority'
    ); // please use config file/folder to handle this
    await Job.create(mockData);
    console.log('Successfully populated the DB');
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

start();
