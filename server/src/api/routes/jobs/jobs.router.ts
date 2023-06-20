import { Router, Application } from 'express';
const router = Router();

import JobsController from './jobs.controller';
import testUser from '../../middlewares/testUser';
import config from '../../../config';
import authenticateUser from '../../middlewares/authentication';
import { Service, Inject } from 'typedi';

@Service()
export default class JobsRouter {
  @Inject() jobsController: JobsController;

  constructor(@Inject() jobsController: JobsController) {
    this.jobsController = jobsController;
  }

  public addJobsRoutes = (app: Application): void => {
    app.use(config.api.prefix + '/jobs', router);

    router.use(authenticateUser);

    router
      .route('/')
      .post(testUser, this.jobsController.createJob)
      .get(this.jobsController.getAllJobs);

    router.get('/stats', this.jobsController.showStats);

    router
      .route('/:id')
      .get(this.jobsController.getJob)
      .delete(testUser, this.jobsController.deleteJob)
      .patch(testUser, this.jobsController.updateJob);
  };
}