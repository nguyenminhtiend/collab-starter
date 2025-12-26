import { serve } from '@hono/node-server';
import { createContainer } from './core/container';
import { createApp } from './app';

// Initialize container (validates env, connects to DB)
const container = createContainer();

// Create the Hono app
const app = createApp(container);

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
      'Server is running',
    );
  },
);
