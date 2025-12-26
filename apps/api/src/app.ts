import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { pinoLogger } from 'hono-pino';
import type { Container } from './core/container';

import { errorHandler, notFoundHandler } from './core/middleware/error-handler';
import { createUsersRoutes } from './modules/users';
import { createDocumentsRoutes } from './modules/documents';

export const createApp = (container: Container) => {
  const app = new Hono()
    // CORS middleware
    .use('*', cors())
    // Global middleware
    .use('*', pinoLogger({ pino: container.logger }))
    // Mount feature modules
    .route('/api/v1/users', createUsersRoutes(container))
    .route('/api/v1/documents', createDocumentsRoutes(container));

  // Error handling
  app.onError(errorHandler);
  app.notFound(notFoundHandler);

  return app;
};

export type AppType = ReturnType<typeof createApp>;
