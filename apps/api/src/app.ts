import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { pinoLogger } from 'hono-pino';
import type { Container } from './core/container';
import type { UpgradeWebSocket } from 'hono/ws';

import { errorHandler, notFoundHandler } from './core/middleware/error-handler';
import { createUsersRoutes } from './modules/users';
import { createDocumentsRoutes } from './modules/documents';
import { createCollaborationRoutes } from './modules/collaboration';

export const createApp = (container: Container, upgradeWebSocket?: UpgradeWebSocket) => {
  const app = new Hono()
    // CORS middleware
    .use('*', cors())
    // Global middleware
    .use('*', pinoLogger({ pino: container.logger }))
    // Mount feature modules
    .route('/api/users', createUsersRoutes(container))
    .route('/api/documents', createDocumentsRoutes(container));

  // Only mount collaboration routes if upgradeWebSocket is provided
  if (upgradeWebSocket) {
    app.route('/collaboration', createCollaborationRoutes(container, upgradeWebSocket));
  }

  // Error handling
  app.onError(errorHandler);
  app.notFound(notFoundHandler);

  return app;
};

export type AppType = ReturnType<typeof createApp>;
