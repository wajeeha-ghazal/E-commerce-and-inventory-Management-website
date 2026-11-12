import { Request, Response } from 'express';
import { ApiErrorResponse } from '@ecomm/shared';

export const notFound = (req: Request, res: Response): void => {
  const response: ApiErrorResponse = {
    success: false,
    error: {
      message: `Endpoint ${req.method} ${req.originalUrl} not found`,
    },
  };

  res.status(404).json(response);
};

export default notFound;
