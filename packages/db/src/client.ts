import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

export type DbOptions = {
  max?: number;
  idleTimeout?: number;
  connectTimeout?: number;
  logger?: boolean | { logQuery: (query: string, params: unknown[]) => void };
};

const defaultOptions: DbOptions = {
  max: 10,
  idleTimeout: 20,
  connectTimeout: 10,
};

export const createDb = (
  connectionString: string,
  options: DbOptions = {},
): PostgresJsDatabase<typeof schema> => {
  const poolOptions = { ...defaultOptions, ...options };

  const client = postgres(connectionString, {
    max: poolOptions.max,
    idle_timeout: poolOptions.idleTimeout,
    connect_timeout: poolOptions.connectTimeout,
  });

  return drizzle(client, {
    schema,
    logger: options.logger,
  });
};

export type DbClient = PostgresJsDatabase<typeof schema>;
