import { BadRequestError } from '../../../api/errors';
import NotFoundError from '../../../api/errors/not-found';
import IJob from '../../../interfaces/IJob';
import JobsService from '../../../services/job';

import { AnyObject, Model } from 'mongoose';

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
  const createJobValidatedInput = {
    company: 'WIX',
    position: 'Backend Developer',
    status: 'pending',
    createdBy: 'some-job-id',
    location: 'San Antonio',
    type: 'full-time',
}

  const jobModel = {
    findOne: async (query: IFindOne) => {
      if (!query._id || !query.createdBy) throw new Error('Catch me error.');
      if (query._id !== jobId || query.createdBy !== userId) return null;
      return mockJob;
    },
    create: async (data: AnyObject) => {
        if (data.status !== 'pending') throw new Error('Catch me error.');
        return { ...data, _id: mockJob._id };
    }
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
    it('Should respond with NotFoundError on not existent userId or jobId', async () => {
      const funcToTest = async () => {
        await jobsService.getOne('non-existent-id', userId);
      };

      expect(funcToTest).rejects.toThrow(NotFoundError);
    });
    it('Should respond with NotFoundError if job model throws any error', async () => {
      const funcToTest = async () => {
        await jobsService.getOne('', '');
      };

      expect(funcToTest).rejects.toThrow(NotFoundError);
    });
  });

  describe('Create One', () => {
    it('Should return a job on valid parameters.', async () => {
        const jobRecord = await jobsService.create(createJobValidatedInput);

      expect(jobRecord).toBeDefined();
      expect(jobRecord._id).toBe(mockJob._id);
    });
    it('Should throw BadRequestError on invalid data.', async () => {
        const internalCreateJobValidatedInput = { ...createJobValidatedInput, status: 'unknown-status' };
        expect(
          async () => await jobsService.create(internalCreateJobValidatedInput)
        ).rejects.toThrow(BadRequestError);
    })
  })
});
