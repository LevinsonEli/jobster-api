require('dotenv').config();

const mockData = require('../MOCK_DATA.json');
const Job = require('../models/Job');
const connectDB = require('./connect');

const start = async () => {
 try {
  await connectDB(process.env.MONGO_URI);
  await Job.create(mockData);
  console.log('Successfully populated the DB');
  process.exit(0);
 } catch (err) {
  console.log(err);
  process.exit(1);
 }
}

start();