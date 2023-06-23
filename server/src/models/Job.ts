const mongoose = require('mongoose')
import IJob from '../interfaces/IJob';
import { Schema, model } from 'mongoose';
import JobStatuses from '../types/jobs/JobStatuses';
import JobTypes from '../types/jobs/JobTypes';

const JobSchema = new Schema<IJob>(
  {
    company: {
      type: String,
      required: [true, 'Please provide company name'],
      maxlength: 50,
    },
    position: {
      type: String,
      required: [true, 'Please provide position'],
      maxlength: 100,
    },
    status: {
      type: String,
      enum: Object.keys(JobStatuses),
      default: 'pending',
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide user'],
    },
    location: {
      type: String,
      default: 'My City',
      maxLength: 30,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.keys(JobTypes),
      default: 'full-time',
    },
  },
  { timestamps: true }
);

export default model<IJob & Document>('Job', JobSchema);