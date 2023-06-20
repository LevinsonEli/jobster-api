const { StatusCodes } = require('http-status-codes');
const {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} = require('../../errors');
import JobValidator from '../../validators/job';
import validateId from '../../validators/index';
import { Request, RequestHandler, Response } from 'express';
import {
  ICreateJobInputDTO,
  IGetAllJobsInputDTO,
  IUpdateJobInputDTO,
} from '../../../interfaces/user-inputs/IJobs';

import JobsService from '../../../services/job';
import IAuthRequest from '../../../interfaces/IAuthRequest';
import { Service, Inject } from 'typedi';

@Service()
export default class JobsController {
  @Inject() jobsService: JobsService;

  constructor(@Inject() jobsService: JobsService) {
    this.jobsService = jobsService;
  }

  getAllJobs = async (req: IAuthRequest, res: Response): Promise<void> => {
    const userId = req.user ? req.user.id : '';
    const validatedInput = JobValidator.getInstance().validateGetAllJobsInput(
      req.query as unknown as IGetAllJobsInputDTO
    );

    const { jobs, totalJobs, numOfPages } = await this.jobsService.getMany(
      userId,
      validatedInput
    );
    res.status(StatusCodes.OK).json({ jobs, totalJobs, numOfPages });
  };

  getJob = async (req: IAuthRequest, res: Response) => {
    const userId = req.user ? req.user.id : '';
    const jobId = req.params.id;
    if (!validateId(jobId)) throw new NotFoundError('Job not found'); // can be refactored to: id = validateId(req.params.id);

    const job = await this.jobsService.getOne(jobId, userId);
    if (!job) throw new NotFoundError('Job not found');
    res.status(StatusCodes.OK).json({ job });
  };

  createJob = async (req: IAuthRequest, res: Response): Promise<void> => {
    const userId = req.user ? req.user.id : '';
    req.body.createdBy = userId;
    const validatedJob = JobValidator.getInstance().validateCreateJobInput(
      req.body as ICreateJobInputDTO
    );

    const job = await this.jobsService.create(validatedJob);
    res.status(StatusCodes.CREATED).json({ job });
  };

  updateJob = async (req: IAuthRequest, res: Response) => {
    const userId = req.user ? req.user.id : '';
    req.body.userId = userId;
    const jobId = (req.body.jobId = req.params.id);
    if (!validateId(jobId)) throw new NotFoundError('Job not found'); // can be refactored to: id = validateId(req.params.id);

    const validatedJob = JobValidator.getInstance().validateUpdateJobInput(
      req.body as IUpdateJobInputDTO
    );

    const job = await this.jobsService.updateOne(jobId, userId, validatedJob);
    res.status(StatusCodes.OK).json({ job });
  };

  deleteJob = async (req: IAuthRequest, res: Response) => {
    const userId = req.user ? req.user.id : '';
    const jobId = req.params.id;
    if (!validateId(jobId)) throw new NotFoundError('Job not found'); // can be refactored to: id = validateId(req.params.id);

    const job = await this.jobsService.deleteOne(jobId, userId);
    res.status(StatusCodes.OK).send();
  };

  showStats = async (req: IAuthRequest, res: Response) => {
    const userId = req.user ? req.user.id : '';
    const { defaultStats, monthlyApplications } =
      await this.jobsService.getStats(userId);
    res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
  };
}