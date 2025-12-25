import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export type DbOptions = {
  max?: number;
  idleTimeout?: number;
  connectTimeout?: number;
};

const defaultOptions: DbOptions = {
  max: 10,
  idleTimeout: 20,
  connectTimeout: 10,
};

// Singleton instance for HMR safety
let dbInstance: PostgresJsDatabase<typeof schema> | null = null;
let clientInstance: ReturnType<typeof postgres> | null = null;

export const createDb = (
  connectionString: string,
  options: DbOptions = {}
): PostgresJsDatabase<typeof schema> => {
  if (dbInstance) {
    return dbInstance;
  }

  const poolOptions = { ...defaultOptions, ...options };

  clientInstance = postgres(connectionString, {
    max: poolOptions.max,
    idle_timeout: poolOptions.idleTimeout,
    connect_timeout: poolOptions.connectTimeout,
  });

  dbInstance = drizzle(clientInstance, { schema });
  return dbInstance;
};

// Graceful shutdown helper
export const closeDb = async () => {
  if (clientInstance) {
    await clientInstance.end();
    clientInstance = null;
    dbInstance = null;
  }
};

// Re-export schema and types
export * from './schema';
export * from './types';
