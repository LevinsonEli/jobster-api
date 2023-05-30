const Job = require('../../models/Job');
const {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} = require('../../errors');
const moment = require('moment');
const mongoose = require('mongoose');

const getMany = async (userId, input) => {
  const { search, status, type, sort, page, limit, skip } = input;
  const queryObject = {
    createdBy: userId,
  };

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

const getOne = async (jobId, userId) => {
  try {
    const job = await Job.findOne({
      _id: jobId,
      createdBy: userId,
    });
    return job;
  } catch (error) {
    throw new NotFoundError('Error occured while sending a job.');
  }
};

const create = async (data) => {
  try {
    const job = await Job.create(data);
    return job;
  } catch (error) {
    throw new BadRequestError('Error occured while creating new job.');
  }
};

const updateOne = async (jobId, userId, data) => {
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
    throw new BadRequestError('Error occured while creating new job.');
  }
};

const deleteOne = async (jobId, userId) => {
  try {
    const job = await Job.findByIdAndRemove({
      _id: jobId,
      createdBy: userId,
    });
    return true;
  } catch (error) {
    throw new NotFoundError('Error occured while deleting the job.');
  }
};

const getStats = async userId => {
  try {
    let stats = await Job.aggregate([
      { $match: { createdBy: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    stats = stats.reduce((acc, curr) => {
      const { _id: title, count } = curr;
      acc[title] = count;
      return acc;
    }, {});

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

    monthlyApplications = monthlyApplications.map(item => {
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
    throw new NotFoundError('Error occured while sending stats.');
  }
};

module.exports = {
  getMany,
  getOne,
  create,
  updateOne,
  deleteOne,
  getStats,
};
