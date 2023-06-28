import validateId from '.';
const {
  UnauthenticatedError,
  NotFoundError,
  BadRequestError,
} = require('../errors');

import GetAllJobsValidatedInput from '../../types/jobs/GetAllJobsValidatedInput';
import CreateJobValidatedInput from '../../types/jobs/CreateJobValidatedInput';
import UpdateJobValidatedInput from '../../types/jobs/UpdateJobValidatedInput';
import {
  IGetAllJobsInputDTO,
  ICreateJobInputDTO,
  IUpdateJobInputDTO,
} from '../../interfaces/user-inputs/IJobs';
import JobStatuses from '../../types/jobs/JobStatuses';
import JobTypes from '../../types/jobs/JobTypes';
import { Service } from 'typedi';

@Service()
export default class JobValidator {

  public validateGetAllJobsInput = (
    input: IGetAllJobsInputDTO
  ): GetAllJobsValidatedInput => {
    const search =
      input.search?.replace(
        /\.|\+|\*|\?|\^|\$|\(|\)|\[|\]|\{|\}|\||\\/gi,
        ''
      ) || '';
    const status =
      input.status && input.status !== 'all'
        ? this.validateStatus(input.status)
        : input.status;
    const type =
      input.type && input.type !== 'all'
        ? this.validateType(input.type)
        : input.type;
    const sort = this.validateSort(input.sort);
    const page = Number(input.page) || 1;
    const limit = Number(input.limit) || 10;
    const skip = (page - 1) * limit;

    return {
      search,
      status,
      type,
      sort,
      page,
      limit,
      skip,
    } as GetAllJobsValidatedInput;
  };

  public validateCreateJobInput = (
    input: ICreateJobInputDTO
  ): CreateJobValidatedInput => {
    const company = this.validateCompany(input.company);
    const position = this.validatePosition(input.position);
    const status = input.status ? this.validateStatus(input.status) : undefined;
    const createdBy = input.createdBy;
    if (!validateId(createdBy))
      throw new UnauthenticatedError('Must login first');
    const location = input.location
      ? this.validateLocation(input.location)
      : undefined;
    const type = input.type ? this.validateType(input.type) : undefined;

    return {
      company,
      position,
      status,
      createdBy,
      location,
      type,
    } as CreateJobValidatedInput;
  };

  public validateUpdateJobInput = (
    input: IUpdateJobInputDTO
  ): UpdateJobValidatedInput => {
    const company = this.validateCompany(input.company);
    const position = this.validatePosition(input.position);
    const status = input.status ? this.validateStatus(input.status) : undefined;
    if (!validateId(input.userId))
      throw new UnauthenticatedError('Must login first');
    if (!validateId(input.jobId)) throw new NotFoundError('Job not found');
    const location = input.location
      ? this.validateLocation(input.location)
      : undefined;
    const type = input.type ? this.validateType(input.type) : undefined;

    return {
      company,
      position,
      status,
      location,
      type,
    } as UpdateJobValidatedInput;
  };

  public validateCompany = (company: string): string => {
    if (!company) throw new BadRequestError('Company name is required for Job');
    if (company.length > 50)
      throw new BadRequestError(
        `Company name can me the most ${50} characters`
      );
    return company;
  };

  public validatePosition = (position: string): string => {
    if (!position) throw new BadRequestError('Position is required for Job');
    if (position.length > 100)
      throw new BadRequestError(`Position can me the most ${100} characters`);
    return position;
  };

  public validateStatus = (status: string): string => {
    if (Object.keys(JobStatuses).includes(status))
      throw new BadRequestError(
        `Status can be one of [${Object.keys(JobStatuses)}]`
      );
    return status;
  };

  public validateLocation = (location: string): string => {
    if (location.length > 30)
      throw new BadRequestError(
        `Location can be the most ${30} characters long`
      );
    return location;
  };

  public validateType = (type: string): string => {
    if (Object.keys(JobTypes).includes(type))
      throw new BadRequestError(
        `Job Type can be one of [${Object.keys(JobTypes)}]`
      );
    return type;
  };

  public validateSort = (sort: string): string => {
    const sortsList = ['a-z', 'z-a', 'latest', 'oldest'];
    const defaultSortValue = sortsList[0];

    if (!sort) return defaultSortValue;
    if (sortsList.indexOf(sort) === -1)
      throw new BadRequestError(
        `Sort value can be one of [${sortsList.toString()}]`
      );

    return sort;
  };
}
