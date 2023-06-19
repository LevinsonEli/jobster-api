const { StatusCodes } = require('http-status-codes')
import { Request, Response, NextFunction } from 'express';
import IAuthRequest from '../../interfaces/IAuthRequest';

interface ICustomError extends Error {
  statusCode?: number; 
}

const errorHandlerMiddleware = (
  err: ICustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(err);
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something went wrong try again later',
  };

  // TODO: refactor. Use only custom errors. Every error that is not custom should be 500. Every error should be handled, otherwise there is a problem.

  // if (err instanceof CustomAPIError) {
  //   return res.status(err.statusCode).json({ msg: err.message })
  // }

  // if (err.name === 'ValidationError') {
  //   customError.msg = Object.values(err.errors)
  //     .map((item) => item.message)
  //     .join(',');
  //   customError.statusCode = 400;
  // }
  // if (err.code && err.code === 11000) {
  //   customError.msg = `Duplicate value entered for ${Object.keys(
  //     err.keyValue
  //   )} field, please choose another value`;
  //   customError.statusCode = 400;
  // }
  // if (err.name === 'CastError') {
  //   customError.msg = `No item found with id : ${err.value}`;
  //   customError.statusCode = 404;
  // }

  return res.status(customError.statusCode).json({ msg: customError.msg });
};

module.exports = errorHandlerMiddleware
