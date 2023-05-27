const { validateId } = require(".");
const { UnauthenticatedError, NotFoundError, BadRequestError } = require("../errors");

const validateCompany = ( company ) => {
    if ( !company )
        throw new BadRequestError('Company name is required for Job');
    if ( company.length > 50 )
        throw new BadRequestError(`Company name can me the most ${50} characters`);
    return company;
}

const validatePosition = ( position ) => {
    if ( !position )
        throw new BadRequestError('Position is required for Job');
    if ( position.length > 100 )
        throw new BadRequestError(`Position can me the most ${100} characters`);
    return position;
}

const validateStatus = ( status ) => {
    const statusesList = ['interview', 'declined', 'pending'];
    if ( statusesList.indexOf(status) === -1 )
        throw new BadRequestError(`Status can be one of [${statusesList.toString()}]`);
    return status;
}

const validateLocation = ( location ) => {
    if ( location.length > 30 )
        throw new BadRequestError(`Location can be the most ${30} characters long`);
    return location;
}

const validateType = ( type ) => {
    const typesList = ['full-time', 'part-time', 'remote', 'internship'];
    if ( typesList.indexOf(type) === -1 )
        throw new BadRequestError(`Job Type can be one of [${typesList.toString()}]`);
    return type;
}

const validateSort = ( sort ) => {
    const sortsList = ['a-z', 'z-a', 'latest', 'oldest'];
    const defaultSortValue = sortsList[0];

    if ( !sort )
        return defaultSortValue;
    if (sortsList.indexOf(sort) === -1)
      throw new BadRequestError(`Sort value can be one of [${sortsList.toString()}]`);

    return sort;
}

const validateGetAllJobsInput = ( input ) => {
    const search = input.search?.replace(/\.|\+|\*|\?|\^|\$|\(|\)|\[|\]|\{|\}|\||\\/gi, '') || '';
    const status =
      input.status && input.status !== 'all'
        ? validateStatus(input.status)
        : input.status;
    const type =
      input.type && input.type !== 'all'
        ? validateType(input.type)
        : input.type;
    const sort = validateSort(input.sort);
    const page = Number(input.page) || 1;
    const limit = Number(input.limit) || 10;
    const skip = (page - 1) * limit;

    return { search, status, type, sort, page, limit, skip };
}

const validateCreateJobInput = ( input ) => {
    const company = validateCompany(input.company);
    const position = validatePosition(input.position);
    const status = input.status ? validateStatus(input.status) : undefined;
    const createdBy = input.createdBy;
    if ( !validateId ( createdBy ) )
        throw new UnauthenticatedError('Must login first');
    const location = input.location ? validateLocation(input.location) : undefined;
    const type = input.type ? validateType(input.type) : undefined;

    return { company, position, status, createdBy, location, type };
}

const validateUpdateJobInput = (input) => {
  const company = validateCompany(input.company);
  const position = validatePosition(input.position);
  const status = input.status ? validateStatus(input.status) : undefined;
  if (!validateId(input.userId))
    throw new UnauthenticatedError('Must login first');
  if (!validateId(input.jobId))
    throw new NotFoundError('Job not found');
  const location = input.location
    ? validateLocation(input.location)
    : undefined;
  const type = input.type ? validateType(input.type) : undefined;

  return { company, position, status, location, type };
};

module.exports = {
  validateCompany,
  validatePosition,
  validateStatus,
  validateLocation,
  validateType,
  validateGetAllJobsInput,
  validateCreateJobInput,
  validateUpdateJobInput,
};