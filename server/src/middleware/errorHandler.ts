import { Request, Response, NextFunction } from 'express';
import { ValidationError as SequelizeValidationError, UniqueConstraintError } from 'sequelize';
import { AppError } from '../utils/AppError';
import { ApiErrorResponse } from '@ecomm/shared';
import { config } from '../config/env';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let fields = err.fields;

  // Handle Sequelize validation errors
  if (err instanceof SequelizeValidationError) {
    statusCode = 400;
    message = 'Validation error';
    fields = {};
    for (const item of err.errors) {
      if (item.path) {
        fields[item.path] = item.message;
      }
    }
  }

  // Handle Sequelize unique constraint errors
  if (err instanceof UniqueConstraintError) {
    statusCode = 409;
    message = 'Resource already exists';
    fields = {};
    for (const item of err.errors) {
      if (item.path) {
        fields[item.path] = `${item.path} must be unique`;
      }
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired';
  }

  if (statusCode >= 500 && config.isProduction) {
    message = 'Internal server error';
  }

  if (!config.isProduction && statusCode >= 500) {
    console.error('Unhandled Server Error:', err);
  }

  const responseBody: ApiErrorResponse = {
    success: false,
    error: {
      message,
      ...(fields && Object.keys(fields).length > 0 ? { fields } : {}),
    },
  };

  res.status(statusCode).json(responseBody);
};

export default errorHandler;
