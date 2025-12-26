import { Hono } from 'hono';
import type { UpgradeWebSocket } from 'hono/ws';
import type { Container } from '../../core/container';
import { CollaborationHandler } from './collaboration.handler';

export const createCollaborationRoutes = (
  container: Container,
  upgradeWebSocket: UpgradeWebSocket,
) => {
  const handler = new CollaborationHandler(container);

  const routes = new Hono().get(
    '/:docId',
    upgradeWebSocket((c) => handler.createWebSocketHandlers(c)),
  );

  return routes;
};

export type CollaborationRoutes = ReturnType<typeof createCollaborationRoutes>;
