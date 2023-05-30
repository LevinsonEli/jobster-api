const Job = require('../../models/Job');
const { StatusCodes } = require('http-status-codes');
const {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} = require('../../errors');
const {
  validateGetAllJobsInput,
  validateCreateJobInput,
  validateUpdateJobInput,
} = require('../../validators/job');
const { validateId } = require('../../validators/index');
const {
  getMany,
  getOne,
  create,
  updateOne,
  deleteOne,
  getStats,
} = require('../../db/controllers/job');

const getAllJobs = async (req, res) => {
  const validatedInput = validateGetAllJobsInput(req.query);
  const { jobs, totalJobs, numOfPages } = await getMany(req.user.id, validatedInput);
  res.status(StatusCodes.OK).json({ jobs, totalJobs, numOfPages });
};

const getJob = async (req, res) => {
  const userId = req.user.id;
  const jobId = req.params.id;
  console.log(jobId);
  console.log(typeof jobId);
  if (!validateId(jobId)) throw new NotFoundError('Job not found'); // can be refactored to: id = validateId(req.params.id);

  const job = await getOne(jobId, userId);
  if (!job) throw new NotFoundError('Job not found');
  res.status(StatusCodes.OK).json({ job });
};

const createJob = async (req, res) => {
  req.body.createdBy = req.user.id;
  const validatedJob = validateCreateJobInput(req.body);
  const job = await create(validatedJob);
  res.status(StatusCodes.CREATED).json({ job });
};

const updateJob = async (req, res) => {
  const userId = (req.body.userId = req.user.id);
  const jobId = (req.body.jobId = req.params.id);
  if (!validateId(jobId)) throw new NotFoundError('Job not found'); // can be refactored to: id = validateId(req.params.id);
  const validatedJob = validateUpdateJobInput(req.body);

  const job = await updateOne(jobId, userId, validatedJob);
  res.status(StatusCodes.OK).json({ job });
};

const deleteJob = async (req, res) => {
  const {
    user: { id: userId },
    params: { id: jobId },
  } = req;
  if (!validateId(jobId)) throw new NotFoundError('Job not found'); // can be refactored to: id = validateId(req.params.id);

  const job = await deleteOne(jobId, userId);
  res.status(StatusCodes.OK).send();
};

const showStats = async (req, res) => {
  const { defaultStats, monthlyApplications } = getStats(req.user.id);
  res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
};

module.exports = {
  createJob,
  deleteJob,
  getAllJobs,
  updateJob,
  getJob,
  showStats,
};
