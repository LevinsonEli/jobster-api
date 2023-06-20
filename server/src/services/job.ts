import Job from '../models/Job';
const moment = require('moment');
const mongoose = require('mongoose');
import { UpdateQuery } from 'mongoose';
import CreateJobValidatedInput from '../types/jobs/CreateJobValidatedInput';
import GetAllJobsValidatedInput from '../types/jobs/GetAllJobsValidatedInput';
import UpdateJobValidatedInput from '../types/jobs/UpdateJobValidatedInput';
import IUser from '../interfaces/IUser';
import IJob from '../interfaces/IJob';
import { Model } from 'mongoose';

interface IQueryObject {
  createdBy: string,
  position: { $regex: string, $options: string },
  status: string,
  type: string,
}

interface IStats {
  pending: number;
  interview: number;
  declined: number;
}

import { Service, Inject } from 'typedi';

@Service()
export default class JobsService {
  @Inject('userModel') userModel: Model<IUser & Document>;
  @Inject('jobModel') jobModel: Model<IJob & Document>;

  constructor(@Inject('userModel') userModel: Model<IUser & Document>,
  @Inject('jobModel') jobModel: Model<IJob & Document>) {
    this.userModel = userModel;
    this.jobModel = jobModel;
  }

  public getMany = async (userId: string, input: GetAllJobsValidatedInput) => {
    const { search, status, type, sort, page, limit, skip } = input;
    const queryObject = {
      createdBy: userId,
    } as IQueryObject;

    if (search) queryObject.position = { $regex: search, $options: 'i' };

    if (status && status !== 'all') queryObject.status = status;
    if (type && type !== 'all') queryObject.type = type;

    let result = this.jobModel.find(queryObject);

    switch (sort) {
      case 'latest':
        result = result.sort('-createdAt');
        break;
      case 'oldest':
        result = result.sort('createdAt');
        break;
      case 'a-z':
        result = result.sort('position');
        break;
      case 'z-a':
        result = result.sort('-position');
        break;
    }

    result = result.skip(skip).limit(limit);

    const jobs = await result;

    const totalJobs = await this.jobModel.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalJobs / limit);
    return { jobs, totalJobs, numOfPages };
  };

  public getOne = async (jobId: string, userId: string) => {
    try {
      const job = await this.jobModel.findOne({
        _id: jobId,
        createdBy: userId,
      });
      return job;
    } catch (error) {
      throw new Error('Error occured while sending a job.');
    }
  };

  public create = async (data: CreateJobValidatedInput) => {
    try {
      const job = await this.jobModel.create(data);
      return job;
    } catch (error) {
      throw new Error('Error occured while creating new job.');
    }
  };

  public updateOne = async (
    jobId: string,
    userId: string,
    data: UpdateJobValidatedInput
  ) => {
    try {
      const { company, position, status, location, type } = data;

      const job = await this.jobModel.findOneAndUpdate(
        { _id: jobId, createdBy: userId },
        { company, position, status, location, type } as UpdateQuery<
          IJob & Document
        >,
        { new: true, runValidators: true }
      );
      return job;
    } catch (error) {
      console.log(error);
      throw new Error('Error occured while creating new job.');
    }
  };

  public deleteOne = async (jobId: string, userId: string) => {
    try {
      const job = await this.jobModel.findByIdAndRemove({
        _id: jobId,
        createdBy: userId,
      });
      return true;
    } catch (error) {
      throw new Error('Error occured while deleting the job.');
    }
  };

  public getStats = async (userId: string) => {
    try {
      let statsTemp = await this.jobModel.aggregate([
        { $match: { createdBy: mongoose.Types.ObjectId(userId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);

      const stats = statsTemp.reduce((acc: any, curr: any) => {
        const { _id: title, count } = curr;
        acc[title] = count;
        return acc;
      }, {}) as IStats;

      const defaultStats = {
        pending: stats.pending || 0,
        interview: stats.interview || 0,
        declined: stats.declined || 0,
      };

      let monthlyApplications = await this.jobModel.aggregate([
        { $match: { createdBy: mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 6 },
      ]);

      monthlyApplications = monthlyApplications.map((item: any) => {
        const {
          _id: { year, month },
          count,
        } = item;
        const date = moment()
          .month(month - 1)
          .year(year)
          .format('MMM Y');
        return { date, count };
      });

      return { defaultStats, monthlyApplications };
    } catch (error) {
      throw new Error('Error occured while sending stats.');
    }
  };
}
