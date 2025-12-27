import { createDb } from '@collab/db';
import { env, type Env } from './env';
import { logger, type Logger } from './logger';

export interface Container {
  db: ReturnType<typeof createDb>;
  logger: Logger;
  env: Env;
}

let containerInstance: Container | null = null;

export const createContainer = (): Container => {
  if (containerInstance) {
    return containerInstance;
  }

  containerInstance = {
    db: createDb(env.DATABASE_URL, {
      logger:
        env.NODE_ENV === 'development'
          ? {
              logQuery: (query, params) => {
                logger.info({ query, params }, 'SQL Query');
              },
            }
          : false,
    }),
    logger,
    env,
  };

  return containerInstance;
};

export const getContainer = (): Container => {
  if (!containerInstance) {
    throw new Error('Container not initialized. Call createContainer() first.');
  }
  return containerInstance;
};

export type AppContainer = Container;
