import express from 'express';
const router = express.Router();

import JobsController from './jobs.controller';
import testUser from '../../middlewares/testUser';

router
  .route('/')
  .post(testUser, JobsController.getInstance().createJob)
  .get(JobsController.getInstance().getAllJobs);

router.get('/stats', JobsController.getInstance().showStats);

router
  .route('/:id')
  .get(JobsController.getInstance().getJob)
  .delete(testUser, JobsController.getInstance().deleteJob)
  .patch(testUser, JobsController.getInstance().updateJob);

export default router;
