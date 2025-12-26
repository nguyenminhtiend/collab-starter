import { createNodeWebSocket } from '@hono/node-ws';
import { serve } from '@hono/node-server';
import { createContainer } from './core/container';
import { createApp } from './app';

// Initialize container (validates env, connects to DB)
const container = createContainer();

// Create WebSocket adapter first (with placeholder app)
const { upgradeWebSocket, injectWebSocket } = createNodeWebSocket({ app: null as any });

// Create the Hono app with container and WebSocket support
const app = createApp(container, upgradeWebSocket);

// Update WebSocket with the actual app
const ws = createNodeWebSocket({ app });

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
ws.injectWebSocket(server);
