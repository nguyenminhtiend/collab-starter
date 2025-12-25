import { Hono } from 'hono';
import type { Container } from '../../core/container';

const startTime = Date.now();

export const createHealthRoutes = (container: Container) => {
  return new Hono().get('/', async (c) => {
    const response = {
      status: 'ok' as const,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: Math.floor((Date.now() - startTime) / 1000),
    };
    return c.json(response);
  });
};

export type HealthRoutes = ReturnType<typeof createHealthRoutes>;
