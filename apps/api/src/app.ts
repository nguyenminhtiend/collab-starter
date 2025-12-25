import { Hono } from 'hono';
import { pinoLogger } from 'hono-pino';
import type { Container } from './core/container';
import { logger } from './core/logger';
import { errorHandler, notFoundHandler } from './core/middleware/error-handler';
import { requestIdMiddleware } from './core/middleware/request-id';
import { createUsersRoutes } from './modules/users';
import { createHealthRoutes } from './modules/health';

export const createApp = (container: Container) => {
  const app = new Hono()
    // Global middleware
    .use('*', requestIdMiddleware)
    .use('*', pinoLogger({ pino: logger }))
    // Mount feature modules
    .route('/api/v1/users', createUsersRoutes(container))
    .route('/health', createHealthRoutes(container));

  // Error handling
  app.onError(errorHandler);
  app.notFound(notFoundHandler);

  return app;
};

export type AppType = ReturnType<typeof createApp>;
