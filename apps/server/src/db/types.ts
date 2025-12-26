import * as schema from './schema';

// Re-export schema
export { schema };

// Database instance type
export type Database = ReturnType<typeof import('./index').createDb>;
