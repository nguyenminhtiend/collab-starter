import type { Context, Next } from 'hono';
import { randomUUID } from 'node:crypto';

export const requestIdMiddleware = async (c: Context, next: Next): Promise<void> => {
  const requestId = c.req.header('X-Request-ID') ?? randomUUID();
  c.set('requestId', requestId);
  c.header('X-Request-ID', requestId);
  await next();
};
