const Job = require('../../../models/Job');
const { StatusCodes } = require('http-status-codes');
const {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} = require('../../errors');
import JobValidator from '../../validators/job';
import validateId from '../../validators/index';
import { Request, RequestHandler, Response } from 'express';
import { ICreateJobInputDTO, IGetAllJobsInputDTO, IUpdateJobInputDTO } from '../../../interfaces/user-inputs/IJobs';

import JobsService from '../../../services/job';
import IAuthRequest from '../../../interfaces/IAuthRequest';

export default class JobsController {
  private static instance: JobsController;
  private constructor() {}

  public static getInstance(): JobsController {
    if (!JobsController.instance) {
      JobsController.instance = new JobsController();
    }
    return JobsController.instance;
  }

  public getAllJobs = async (req: IAuthRequest, res: Response) => {
    const userId = req.user ? req.user.id : '';
    const validatedInput = JobValidator.getInstance().validateGetAllJobsInput(
      req.query as unknown as IGetAllJobsInputDTO
    );
    // const validatedInput: IGetAllJobsValidatedInput = validateGetAllJobsInput(req.query);

    const { jobs, totalJobs, numOfPages } =
      await JobsService.getInstance().getMany(userId, validatedInput);
    res.status(StatusCodes.OK).json({ jobs, totalJobs, numOfPages });
  };

  public getJob = async (req: IAuthRequest, res: Response) => {
    const userId = req.user ? req.user.id : '';
    const jobId = req.params.id;
    if (!validateId(jobId)) throw new NotFoundError('Job not found'); // can be refactored to: id = validateId(req.params.id);

    const job = await JobsService.getInstance().getOne(jobId, userId);
    if (!job) throw new NotFoundError('Job not found');
    res.status(StatusCodes.OK).json({ job });
  };

  public createJob = async (req: IAuthRequest, res: Response) => {
    const userId = req.user ? req.user.id : '';
    req.body.createdBy = userId;
    const validatedJob = JobValidator.getInstance().validateCreateJobInput(
      req.body as ICreateJobInputDTO
    );
    // const validatedJob = validateCreateJobInput(req.body);
    const job = await JobsService.getInstance().create(validatedJob);
    res.status(StatusCodes.CREATED).json({ job });
  };

  public updateJob = async (req: IAuthRequest, res: Response) => {
    const userId = req.user ? req.user.id : '';
    req.body.userId = userId;
    const jobId = (req.body.jobId = req.params.id);
    if (!validateId(jobId)) throw new NotFoundError('Job not found'); // can be refactored to: id = validateId(req.params.id);

    const validatedJob = JobValidator.getInstance().validateUpdateJobInput(
      req.body as IUpdateJobInputDTO
    );
    // const validatedJob = validateUpdateJobInput(req.body);

    const job = await JobsService.getInstance().updateOne(
      jobId,
      userId,
      validatedJob
    );
    res.status(StatusCodes.OK).json({ job });
  };

  public deleteJob = async (req: IAuthRequest, res: Response) => {
    const userId = req.user ? req.user.id : '';
    const jobId = req.params.id;
    if (!validateId(jobId)) throw new NotFoundError('Job not found'); // can be refactored to: id = validateId(req.params.id);

    const job = await JobsService.getInstance().deleteOne(jobId, userId);
    res.status(StatusCodes.OK).send();
  };

  public showStats = async (req: IAuthRequest, res: Response) => {
    const userId = req.user ? req.user.id : '';
    const { defaultStats, monthlyApplications } =
      await JobsService.getInstance().getStats(userId);
    res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
  };
}
