import { serve } from '@hono/node-server';
import { createContainer } from './core/container';
import { createApp } from './app';

// Initialize container (validates env, connects to DB)
const container = createContainer();

// Create the Hono app with container
const app = createApp(container);

// Start the server
const port = container.env.PORT;

container.logger.info({ port }, 'Starting server...');

serve({
  fetch: app.fetch,
  port,
});

container.logger.info(
  {
    port,
    api: `http://localhost:${port}/api/v1`,
    health: `http://localhost:${port}/health`,
  },
  'Server is running'
);
