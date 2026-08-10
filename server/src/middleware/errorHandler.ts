import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('[ServerError]', err.message || err);

  const statusCode = err.statusCode || res.statusCode !== 200 ? res.statusCode : 500;
  const userMessage = err.isUserFacing ? err.message : 'Unable to process video request.';

  res.status(statusCode >= 400 && statusCode < 600 ? statusCode : 500).json({
    success: false,
    error: userMessage,
  });
}
