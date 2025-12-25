import type { Context } from 'hono';
import { ZodError } from 'zod';
import { HTTPException } from 'hono/http-exception';
import { AppError } from '../errors';
import { getContainer } from '../container';

interface ErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}

export const errorHandler = (err: Error, c: Context): Response => {
  let response: ErrorResponse;
  let status: number;

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    response = {
      error: 'Validation Error',
      code: 'VALIDATION_ERROR',
      details: err.flatten(),
    };
    status = 400;
  }
  // Handle custom app errors
  else if (err instanceof AppError) {
    response = {
      error: err.message,
      code: err.code,
      details: 'details' in err ? (err as unknown as { details: unknown }).details : undefined,
    };
    status = err.statusCode;
  }
  // Handle Hono HTTP exceptions
  else if (err instanceof HTTPException) {
    response = {
      error: err.message,
    };
    status = err.status;
  }
  // Handle unknown errors
  else {
    const container = getContainer();
    container.logger.error({ err }, 'Unhandled error');

    response = {
      error: 'Internal Server Error',
    };
    status = 500;
  }

  return c.json(response, status as 400 | 401 | 403 | 404 | 409 | 500);
};

export const notFoundHandler = (c: Context): Response => {
  return c.json(
    {
      error: 'Not Found',
      code: 'ROUTE_NOT_FOUND',
      message: `Route ${c.req.method} ${c.req.path} not found`,
    },
    404,
  );
};
