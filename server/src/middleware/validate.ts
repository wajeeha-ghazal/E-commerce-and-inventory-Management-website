import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ApiErrorResponse } from '@ecomm/shared';

export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const fields: Record<string, string> = {};
    for (const error of errors.array()) {
      if ('path' in error && error.path) {
        fields[error.path] = error.msg;
      } else if ('param' in error && (error as any).param) {
        fields[(error as any).param] = error.msg;
      }
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        message: 'Validation failed',
        fields,
      },
    };

    res.status(400).json(errorResponse);
    return;
  }

  next();
};

export default validate;
