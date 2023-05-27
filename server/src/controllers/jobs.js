const Job = require('../models/Job')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError, UnauthenticatedError } = require('../errors')
const moment = require('moment');
const mongoose = require('mongoose');
const {
  validateGetAllJobsInput,
  validateCreateJobInput,
  validateUpdateJobInput,
} = require('../validators/job');
const { validateId } = require('../validators/index');

const getAllJobs = async (req, res) => {
  const { search, status, type, sort, page, limit, skip } =
    validateGetAllJobsInput(req.query);
  const queryObject = {
    createdBy: req.user.id
  }

  if (search)
    queryObject.position = { $regex: search, $options: 'i' };

  if (status && status !== 'all')
    queryObject.status = status;
  if (type && type !== 'all') 
    queryObject.type = type;

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
  res.status(StatusCodes.OK).json({ jobs, totalJobs, numOfPages })
}

const getJob = async (req, res) => {
  const userId = req.user.id;
  const jobId = req.params.id;
  if ( !validateId( jobId ) )
    throw new NotFoundError(`No job with id ${jobId}`);

  const job = await Job.findOne({
    _id: jobId,
    createdBy: userId,
  })
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`)
  }
  res.status(StatusCodes.OK).json({ job });
}

const createJob = async (req, res) => {
  req.body.createdBy = req.user.id;
  const validatedJob = validateCreateJobInput(req.body);
  const job = await Job.create(validatedJob);
  res.status(StatusCodes.CREATED).json({ job });
}

const updateJob = async (req, res) => {
  const userId = req.body.userId = req.user.id;
  const jobId = req.body.jobId = req.params.id;
  const validatedJob = validateUpdateJobInput(req.body);

  const job = await Job.findByIdAndUpdate(
    { _id: jobId, createdBy: userId },
    validatedJob,
    { new: true, runValidators: true }
  );
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`)
  }
  res.status(StatusCodes.OK).json({ job });
}

const deleteJob = async (req, res) => {
  const {
    user: { id: userId },
    params: { id: jobId },
  } = req;

  const job = await Job.findByIdAndRemove({
    _id: jobId,
    createdBy: userId,
  })
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`)
  }
  res.status(StatusCodes.OK).send()
}

const showStats = async (req, res) => {
  const userId = req.user.id;
  if (!validateId(userId))
    throw new UnauthenticatedError('Must login first');
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
    { $match: {createdBy: mongoose.Types.ObjectId(userId ) } },
    { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 6 },
  ]);
  
  monthlyApplications = monthlyApplications.map((item) => {
    const { _id: { year, month }, count } = item;
    const date = moment().month(month - 1).year(year).format('MMM Y');
    return { date, count };
  });

  res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
}

module.exports = {
  createJob,
  deleteJob,
  getAllJobs,
  updateJob,
  getJob,
  showStats,
};
