import NotFoundError from '../../../api/errors/not-found';
import IJob from '../../../interfaces/IJob';
import JobsService from '../../../services/job';

import { Model } from 'mongoose';

describe('Jobs Service unit tests', () => {
  const mockJob = {
    _id: 'mock-job-id',
  };
  const jobId = 'some-job-id';
  const userId = 'some-user-id';

  interface IFindOne {
    _id?: string;
    createdBy?: string;
  }

  const jobModel = {
    findOne: async (query: IFindOne) => {
      if (!query._id || !query.createdBy) throw new Error('Catch me error.');
      if (query._id !== jobId || query.createdBy !== userId) return null;
      return mockJob;
    },
  };
  const jobsService = new JobsService(
    jobModel as unknown as Model<IJob & Document>
  );

  describe('Get One', () => {
    it('Should return a Job on valid parameters', async () => {
      const jobRecord = await jobsService.getOne(jobId, userId);

      expect(jobRecord).toBeDefined();
      expect(jobRecord._id).toBe('mock-job-id');
    });
    it('Should respond with "not found error" on not existent userId or jobId', async () => {
      const funcToTest = async () => {
        await jobsService.getOne('non-existent-id', userId);
      };

      expect(funcToTest).rejects.toThrow(NotFoundError);
    });
    it('Should respond with "not found error" if job model throws any error', async () => {
      const funcToTest = async () => {
        await jobsService.getOne('', '');
      };

      expect(funcToTest).rejects.toThrow(NotFoundError);
    });
  });
});
