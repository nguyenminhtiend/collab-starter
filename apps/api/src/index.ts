import { createNodeWebSocket } from '@hono/node-ws';
import { serve } from '@hono/node-server';
import { createContainer } from './core/container';
import { createApp } from './app';
import { createCollaborationRoutes } from './modules/collaboration';

// Initialize container (validates env, connects to DB)
const container = createContainer();

// Create the Hono app without WebSocket routes first
const app = createApp(container);

// Create WebSocket adapter with the app
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

// Now add the collaboration routes with WebSocket support
app.route('/collaboration', createCollaborationRoutes(container, upgradeWebSocket));

// Start the server
const port = container.env.PORT;

container.logger.info({ port }, 'Starting server...');

const server = serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    container.logger.info(
      {
        url: `http://localhost:${info.port}`,
      },
      'Server is running with WebSocket support',
    );
  },
);

// Inject WebSocket into the running server
injectWebSocket(server);
