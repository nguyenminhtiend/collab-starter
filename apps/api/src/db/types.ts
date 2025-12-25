import * as schema from './schema';

// Re-export schema
export { schema };

// User types based on schema definition
export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NewUser = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateUser = Partial<NewUser>;

// Database instance type
export type Database = ReturnType<typeof import('./index').createDb>;
