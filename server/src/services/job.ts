import Job from '../models/Job';
const moment = require('moment');
const mongoose = require('mongoose');
import CreateJobValidatedInput from '../types/jobs/CreateJobValidatedInput';
import GetAllJobsValidatedInput from '../types/jobs/GetAllJobsValidatedInput';
import UpdateJobValidatedInput from '../types/jobs/UpdateJobValidatedInput';

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

export default class JobsService {
  private static instance: JobsService;
  private constructor() {}

  public static getInstance(): JobsService {
    if (!JobsService.instance) {
      JobsService.instance = new JobsService();
    }
    return JobsService.instance;
  }

  public getMany = async (userId: string, input: GetAllJobsValidatedInput) => {
    const { search, status, type, sort, page, limit, skip } = input;
    const queryObject = {
      createdBy: userId,
    } as IQueryObject;

    if (search) queryObject.position = { $regex: search, $options: 'i' };

    if (status && status !== 'all') queryObject.status = status;
    if (type && type !== 'all') queryObject.type = type;

    let result = Job.find(queryObject);

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

    const totalJobs = await Job.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalJobs / limit);
    return { jobs, totalJobs, numOfPages };
  };

  public getOne = async (jobId: string, userId: string) => {
    try {
      const job = await Job.findOne({
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
      const job = await Job.create(data);
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

      const job = await Job.findOneAndUpdate(
        { _id: jobId, createdBy: userId },
        { company, position, status, location, type },
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
      const job = await Job.findByIdAndRemove({
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
      let statsTemp = await Job.aggregate([
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

      let monthlyApplications = await Job.aggregate([
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
