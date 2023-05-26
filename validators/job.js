const { validateId } = require(".");
const { UnauthenticatedError, NotFoundError } = require("../errors");

const validateCompany = ( company ) => {
    if ( !company )
        throw new Error('Company name is required for Job');
    if ( company.length > 50 )
        throw new Error(`Company name can me the most ${50} characters`);
    return company;
}

const validatePosition = ( position ) => {
    if ( !position )
        throw new Error('Position name is required for Job');
    if ( position.length > 100 )
        throw new Error(`Position name can me the most ${100} characters`);
    return position;
}

const validateStatus = ( status ) => {
    const statusesList = ['interview', 'declined', 'pending'];
    if ( statusesList.indexOf(status) === -1 )
        throw new Error(`Status can be one of [${statusesList.toString()}]`);
    return status;
}

const validateLocation = ( location ) => {
    if ( location.length > 20 )
        throw new Error(`Location can be the most ${20} characters long`);
    return location;
}

const validateType = ( type ) => {
    const typesList = ['full-time', 'part-time', 'remote', 'internship'];
    if ( typesList.indexOf(type) === -1 )
        throw new Error(`Job Type can be one of [${typesList.toString()}]`);
    return type;
}

const validateSort = ( sort ) => {
    const sortsList = ['a-z', 'z-a', 'oldest', 'newest'];
    const defaultSortValue = sortsList[0];

    if ( !sort )
        return defaultSortValue;
    if (sortsList.indexOf(sort) === -1)
      throw new Error(`Sort value can be one of [${sortsList.toString()}]`);

    return sort;
}

const validateGetAllJobsInput = ( input ) => {
    const search = input.search;
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
    const status = input.status ? validateStatus : undefined;
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
  const status = input.status ? validateStatus : undefined;
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

// change tab to be 2 spaces
// change prettier to be if -> return on separate lines
// change (property) to be ( property )