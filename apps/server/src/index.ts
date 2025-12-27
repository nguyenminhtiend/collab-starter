import { createNodeWebSocket } from '@hono/node-ws';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { pinoLogger } from 'hono-pino';
import { createContainer } from './core/container';
import { CollaborationHandler } from './modules/collaboration';

// Initialize container
const container = createContainer();

const app = new Hono();

// Global middleware
app.use('*', cors());
app.use('*', pinoLogger({ pino: container.logger }));

// Create WebSocket adapter
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

const collabHandler = new CollaborationHandler(container);

app.get('/health', (c) => c.json({ status: 'ok' }));

app.use('*', async (c, next) => {
  console.log(`[DEBUG] Incoming request: ${c.req.method} ${c.req.url}`);
  await next();
});

app.get(
  '/collaboration/:docId',
  upgradeWebSocket((c) => {
    const docId = c.req.param('docId');
    console.log(`[DEBUG] WebSocket Upgrade Request for docId: ${docId}`);
    return collabHandler.createWebSocketHandlers(c);
  }),
);

const port = container.env.WS_PORT;

container.logger.info({ port }, 'Starting WebSocket server...');

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
      'WebSocket Server is running',
    );
  },
);

injectWebSocket(server);
